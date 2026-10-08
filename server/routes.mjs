import express from "express";
import { Hostel, Booking } from "./models.mjs";
import { syncHostelsFromGoogle } from "./services/googlePlaces.mjs";

const router = express.Router();

// Sync from Google Places
router.post("/sync/google", async (req, res) => {
    const { city } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";


    if (!city) {
        return res.status(400).json({ success: false, message: "Missing required field: city" });
    }

    const result = await syncHostelsFromGoogle(city, apiKey);
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// Get all hostels
router.get("/hostels", async (req, res) => {
    try {
        const hostels = await Hostel.find();
        res.json(hostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new hostel
router.post("/hostels", async (req, res) => {
    const hostel = new Hostel(req.body);
    try {
        const newHostel = await hostel.save();
        res.status(201).json(newHostel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create a booking
router.post("/bookings", async (req, res) => {
    const booking = new Booking(req.body);
    try {
        const newBooking = await booking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user bookings
router.get("/bookings/:userId", async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId }).populate('hostelId');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a hostel
router.delete("/hostels/:id", async (req, res) => {
    try {
        const result = await Hostel.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Hostel not found" });
        }
        res.json({ success: true, message: "Hostel deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
