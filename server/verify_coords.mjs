import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hostel-booking";

async function verify() {
    await mongoose.connect(MONGODB_URI);
    const hostels = await mongoose.connection.db.collection("hostels")
        .find({}, { projection: { name: 1, coordinates: 1, _id: 0 } })
        .toArray();

    const lines = ["=== HOSTEL COORDINATES ===", ""];
    let allOk = true;
    for (const h of hostels) {
        const c = h.coordinates || [0, 0];
        const ok = c[0] > 5 && c[0] < 37 && c[1] > 68 && c[1] < 98;
        if (!ok) allOk = false;
        lines.push(`${ok ? "OK" : "BAD"} | ${h.name} | [${c[0]}, ${c[1]}]`);
    }
    lines.push("", `Total: ${hostels.length} hostels`);
    lines.push(`All valid: ${allOk}`);

    fs.writeFileSync("coords_report.json", JSON.stringify(hostels, null, 2), "utf8");
    console.log(lines.join("\n"));

    await mongoose.disconnect();
}

verify().catch(console.error);
