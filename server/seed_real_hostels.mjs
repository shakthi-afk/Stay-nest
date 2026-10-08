import mongoose from "mongoose";
import dotenv from "dotenv";
import { syncHostelsFromGoogle } from "./services/googlePlaces.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hostel-booking";

// Seeding top cities across India (including Tamil Nadu focus and popular tourist cities)
const POPULAR_CITIES = [
    "Chennai",
    "Madurai",
    "Coimbatore",
    "Ooty",
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Goa",
    "Kochi",
    "Jaipur",
    "Udaipur",
    "Manali",
    "Rishikesh"
];

async function seed() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.\n");

    for (const city of POPULAR_CITIES) {
        console.log(`\n========================================`);
        console.log(`SEEDING REAL HOSTELS FOR: ${city}`);
        console.log(`========================================`);
        try {
            // Run sync for the city
            const res = await syncHostelsFromGoogle(city, "");
            console.log(`Result for ${city}:`, res.message);
        } catch (err) {
            console.error(`Error seeding ${city}:`, err.message);
        }
        // Wait 3 seconds between cities to respect OpenStreetMap Nominatim/Overpass rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log("\nSeeding completed successfully!");
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error("Fatal seed error:", err);
    process.exit(1);
});
