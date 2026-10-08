import axios from 'axios';
const HEADERS = { 'User-Agent': 'StayNest/1.0 (hostel-booking-app)' };

async function geocodeCity(city) {
    try {
        console.log("Geocoding", city);
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
        console.log("Geocode success:", response.data[0]);
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

async function queryOverpass(lat, lng, radiusMeters = 10000) {
    const query = `[out:json][timeout:60];(node["tourism"="hostel"](around:${radiusMeters},${lat},${lng});way["tourism"="hostel"](around:${radiusMeters},${lat},${lng}););out center body 30;`;

    console.log(`[Overpass] Querying radius ${radiusMeters}m around ${lat},${lng}`);

    try {
        const response = await axios.get(
            'https://overpass-api.de/api/interpreter',
            {
                params: { data: query },
                headers: HEADERS,
                timeout: 65000
            }
        );
        console.log("Overpass success, found:", response.data.elements?.length);
        return response.data.elements || [];
    } catch (err) {
        console.log("Overpass failed:", err.message);
        if (radiusMeters > 5000) {
            console.warn(`[Overpass] Timeout at ${radiusMeters}m, retrying with 5000m`);
            return queryOverpass(lat, lng, 5000);
        }
        throw err;
    }
}

async function runTest() {
    console.log("Starting test...");
    const geo = await geocodeCity("chennai");
    if (geo) {
        await queryOverpass(geo.lat, geo.lng);
    }
}

runTest();
