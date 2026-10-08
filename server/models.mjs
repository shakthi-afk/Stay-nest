import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    isAC: { type: Boolean, default: false },
    image: { type: String, required: true },
    rating: { type: Number, default: 5.0 },
    availableRooms: { type: Number, default: 10 },
    amenities: [String],
    roomTypes: [String],
    distanceFromCenter: String,
    cancellationPolicy: String,
    coordinates: {
        type: [Number], // [latitude, longitude]
        default: [0, 0]
    },
    description: String,
    images: [String]
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Keeping as string to match current frontend logic
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    hostelName: String,
    checkIn: String,
    checkOut: String,
    guests: Number,
    roomType: String,
    total: Number,
    status: { type: String, default: 'Confirmed' },
    bookingDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const Hostel = mongoose.model("Hostel", hostelSchema);
export const Booking = mongoose.model("Booking", bookingSchema);
