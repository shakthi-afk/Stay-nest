import mongoose from "mongoose";
import dotenv from "dotenv";
import https from "https";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hostel-booking";

// Nominatim geocode with delay to respect rate limits
function geocode(query) {
    return new Promise((resolve, reject) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`;
        https.get(url, { headers: { 'User-Agent': 'StayNest/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.length > 0) {
                        resolve([parseFloat(parsed[0].lat), parseFloat(parsed[0].lon)]);
                    } else {
                        resolve(null);
                    }
                } catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// Known city coordinates as fallback
const CITY_COORDS = {
    "madurai":    [9.9252,  78.1198],
    "chennai":    [13.0827, 80.2707],
    "mumbai":     [19.0760, 72.8777],
    "delhi":      [28.6139, 77.2090],
    "bangalore":  [12.9716, 77.5946],
    "bengaluru":  [12.9716, 77.5946],
    "kolkata":    [22.5726, 88.3639],
    "hyderabad":  [17.3850, 78.4867],
    "pune":       [18.5204, 73.8567],
    "jaipur":     [26.9124, 75.7873],
    "goa":        [15.2993, 74.1240],
    "manali":     [32.2396, 77.1887],
    "varanasi":   [25.3176, 82.9739],
    "egmore":     [13.0732, 80.2609],
    "coimbatore":  [11.0168, 76.9558],
    "pondicherry": [11.9416, 79.8083],
    "kochi":      [9.9312,  76.2673],
    "mysore":     [12.2958, 76.6394],
    "udaipur":    [24.5854, 73.7125],
    "agra":       [27.1767, 78.0081],
    "lucknow":    [26.8467, 80.9462],
    "amritsar":   [31.6340, 74.8723],
    "shimla":     [31.1048, 77.1734],
    "darjeeling": [27.0410, 88.2663],
    "ooty":       [11.4102, 76.6950],
    "trichy":     [10.7905, 78.7047],
    "visakhapatnam": [17.6868, 83.2185],
};

function getCityFallback(name, location) {
    const text = `${name} ${location}`.toLowerCase();
    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (text.includes(city)) return coords;
    }
    return null;
}

function jitter(val) {
    return parseFloat((val + (Math.random() - 0.5) * 0.008).toFixed(6));
}

async function fixAll() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const collection = mongoose.connection.db.collection("hostels");
    const hostels = await collection.find({}).toArray();
    let fixed = 0;

    for (const hostel of hostels) {
        // Try geocoding the full location string
        let coords = await geocode(`${hostel.name}, ${hostel.location}, India`);
        await sleep(1100); // Nominatim rate limit: 1 request/second

        if (!coords) {
            // Try just the location
            coords = await geocode(`${hostel.location}, India`);
            await sleep(1100);
        }

        if (!coords) {
            // Try city fallback
            const fallback = getCityFallback(hostel.name, hostel.location);
            if (fallback) {
                coords = [jitter(fallback[0]), jitter(fallback[1])];
                console.log(`   Fallback: ${hostel.name} => [${coords}] (city lookup)`);
            }
        }

        if (coords) {
            await collection.updateOne(
                { _id: hostel._id },
                { $set: { coordinates: [parseFloat(coords[0].toFixed(6)), parseFloat(coords[1].toFixed(6))] } }
            );
            console.log(`OK ${hostel.name} => [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`);
            fixed++;
        } else {
            console.log(`SKIP ${hostel.name} - could not geocode`);
        }
    }

    console.log(`\nDone! Fixed ${fixed}/${hostels.length} hostels.`);
    await mongoose.disconnect();
}

fixAll().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
