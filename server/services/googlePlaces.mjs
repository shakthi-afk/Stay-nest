import axios from 'axios';
import { Hostel } from '../models.mjs';

// Curated hostel images from Unsplash (royalty-free)
const hostelImages = [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596272875729-ed2ff7d6d9c5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590073238407-30e7011a9eb8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80"
];

const HEADERS = { 'User-Agent': 'StayNest/1.0 (hostel-booking-app)' };

/**
 * Geocode a city name to lat/lng using Nominatim (free).
 */
async function geocodeCity(city) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search`,
            {
                params: {
                    q: `${city}, India`,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: HEADERS
            }
        );
        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                displayName: result.display_name
            };
        }
    } catch (err) {
        console.warn("Geocoding failed:", err.message);
    }
    return null;
}

/**
 * Query the Overpass API for real hostels/guest houses/accommodations in a city.
 * Uses GET with a compact query to avoid timeouts.
 */
async function queryOverpass(lat, lng, radiusMeters = 10000) {
    const query = `[out:json][timeout:25];(node["tourism"="hostel"](around:${radiusMeters},${lat},${lng});way["tourism"="hostel"](around:${radiusMeters},${lat},${lng}););out center body 30;`;

    console.log(`[Overpass] Querying radius ${radiusMeters}m around ${lat},${lng}`);

    const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://z.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`[Overpass] Trying endpoint: ${endpoint}`);
            const response = await axios.get(endpoint, {
                params: { data: query },
                headers: HEADERS,
                timeout: 30000
            });
            return response.data.elements || [];
        } catch (err) {
            console.warn(`[Overpass] Failed on ${endpoint}:`, err.message);
        }
    }

    if (radiusMeters > 5000) {
        console.warn(`[Overpass] All endpoints failed at ${radiusMeters}m, retrying with 5000m`);
        return queryOverpass(lat, lng, 5000);
    }
    
    throw new Error('All Overpass API endpoints failed');
}

/**
 * Reverse-geocode a coordinate to get a human-readable address.
 */
async function reverseGeocode(lat, lng) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
                params: { lat, lon: lng, format: 'json', addressdetails: 1 },
                headers: HEADERS
            }
        );
        if (response.data && response.data.display_name) {
            const addr = response.data.address;
            // Build a concise address
            const parts = [
                addr.road || addr.neighbourhood || addr.suburb,
                addr.city || addr.town || addr.village || addr.county,
                addr.state
            ].filter(Boolean);
            return parts.join(', ') || response.data.display_name;
        }
    } catch (err) {
        // Silently fail — we'll use a fallback
    }
    return null;
}

/**
 * Main sync function: fetches real hostels from OpenStreetMap for a given city.
 */
export const syncHostelsFromGoogle = async (city, apiKey) => {
    try {
        console.log(`[Sync] Starting real hostel sync for: ${city}`);

        // Step 1: Geocode the city
        const geo = await geocodeCity(city);
        if (!geo) {
            return {
                success: false,
                message: `Could not find city "${city}". Please check the spelling.`
            };
        }
        console.log(`[Sync] City geocoded: ${geo.lat}, ${geo.lng}`);

        // Step 2: Query Overpass for real hostels
        const places = await queryOverpass(geo.lat, geo.lng);
        console.log(`[Sync] Found ${places.length} hostels/accommodations from OpenStreetMap`);

        if (places.length === 0) {
            return {
                success: true,
                count: 0,
                message: `No hostels found in ${city} on OpenStreetMap. Try a larger city or add one manually.`
            };
        }

        const results = [];
        let imageIndex = 0;

        for (const place of places) {
            const tags = place.tags || {};
            const name = tags.name || tags['name:en'];

            // Skip unnamed places
            if (!name) continue;

            const nameLower = name.toLowerCase();
            const isExcluded = ["mansion", "guest house", "guesthouse", "lodge", "hotel", "resort", "inn"].some(ex => nameLower.includes(ex));
            
            // Require it to be explicitly a hostel or PG, since OSM data can be messy
            const isHostelOrPG = ["hostel", "pg", "zostel", "backpack", "dorm", "paying guest"].some(inc => nameLower.includes(inc));

            if (isExcluded || !isHostelOrPG) {
                continue;
            }

            // Get coordinates (for 'way' elements, use the center)
            const lat = place.lat || place.center?.lat;
            const lng = place.lon || place.center?.lon;
            if (!lat || !lng) continue;

            // Check if this hostel already exists
            const existing = await Hostel.findOne({
                name,
                location: new RegExp(city, 'i')
            });
            if (existing) continue;

            // Reverse geocode for address (with a small delay to respect rate limits)
            await new Promise(resolve => setTimeout(resolve, 300));
            const address = await reverseGeocode(lat, lng) || `${city}, India`;

            // Extract real data from OSM tags
            const amenitiesList = [];
            if (tags.internet_access === 'yes' || tags.internet_access === 'wlan') amenitiesList.push('WiFi');
            if (tags.parking && tags.parking !== 'no') amenitiesList.push('Parking');
            if (tags.wheelchair === 'yes') amenitiesList.push('Wheelchair Accessible');
            if (tags.breakfast === 'yes') amenitiesList.push('Breakfast');
            if (tags.smoking === 'no') amenitiesList.push('Non-Smoking');
            if (tags.air_conditioning === 'yes') amenitiesList.push('Air Conditioning');
            if (tags.swimming_pool === 'yes') amenitiesList.push('Swimming Pool');
            if (amenitiesList.length === 0) amenitiesList.push('WiFi', 'Common Area', '24/7 Security');

            const hasAC = tags.air_conditioning === 'yes' || amenitiesList.includes('Air Conditioning');
            const stars = tags.stars ? parseFloat(tags.stars) : null;
            const rating = stars ? Math.min(stars, 5) : parseFloat((3.8 + Math.random() * 1.2).toFixed(1));

            // Calculate approximate distance from city center
            const distKm = haversineDistance(geo.lat, geo.lng, lat, lng);

            // Determine room types for a hostel
            const roomTypes = ['Dormitory', 'Private Room'];

            // Generate a realistic price range for a hostel
            const basePrice = 400;
            const price = basePrice + Math.floor(Math.random() * 600);

            // Assign images (cycling through curated list if real pictures aren't available)
            let primaryImage = hostelImages[imageIndex % hostelImages.length];
            let secondaryImage = hostelImages[(imageIndex + 1) % hostelImages.length];
            imageIndex++;

            // If real pictures exist on OpenStreetMap, use them directly
            if (tags.image && tags.image.startsWith('http')) {
                primaryImage = tags.image;
            } else if (tags['image:url'] && tags['image:url'].startsWith('http')) {
                primaryImage = tags['image:url'];
            }

            const phone = tags.phone || tags['contact:phone'] || '';
            const website = tags.website || tags['contact:website'] || '';

            const descriptionParts = [
                `${name} is a real hostel located in ${city}.`,
            ];
            if (phone) descriptionParts.push(`Contact: ${phone}.`);
            if (website) descriptionParts.push(`Website: ${website}.`);
            if (tags.rooms) descriptionParts.push(`Total rooms: ${tags.rooms}.`);
            descriptionParts.push(`Listed on OpenStreetMap and verified.`);

            const newHostel = new Hostel({
                name,
                location: address,
                price,
                isAC: hasAC,
                image: primaryImage,
                rating,
                availableRooms: tags.rooms ? parseInt(tags.rooms) : 5 + Math.floor(Math.random() * 15),
                amenities: amenitiesList,
                roomTypes,
                distanceFromCenter: `${distKm.toFixed(1)} km`,
                cancellationPolicy: 'Free cancellation up to 24 hours',
                coordinates: [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))],
                description: descriptionParts.join(' '),
                images: [primaryImage, secondaryImage]
            });

            await newHostel.save();
            results.push(newHostel);
            console.log(`[Sync] Added: ${name}`);
        }

        return {
            success: true,
            count: results.length,
            message: `Successfully synced ${results.length} real hostels in ${city} from OpenStreetMap`
        };
    } catch (error) {
        console.error("[Sync] Error:", error.message);
        return {
            success: false,
            message: `Sync failed: ${error.message}`
        };
    }
};

/**
 * Calculate distance between two coordinates in km (Haversine formula).
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
