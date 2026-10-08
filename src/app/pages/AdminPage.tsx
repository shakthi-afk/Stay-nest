import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
// import { supabase } from "../lib/supabase"; // Removed for MongoDB migration
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { PlusCircle, Image as ImageIcon, MapPin, Trash2, Home } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Draggable Marker component for Admin Map
function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);

    return (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    setPosition([position.lat, position.lng]);
                },
            }}
        />
    );
}

export function AdminPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        price: "",
        isAC: false,
        image: "",
        rating: "5.0",
        availableRooms: "10",
        amenities: "WiFi, Food, Laundry",
        roomTypes: "1 Bed, 2 Bed",
        distanceFromCenter: "1.0 km",
        cancellationPolicy: "Free cancellation up to 24 hours before check-in.",
        coordinates: "0,0",
        description: "",
        images: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // We rely on the secure AdminLoginPage to set this flag after verifying the DB role.
    const isAdminAuthed = localStorage.getItem("isAdminAuthenticated") === "true";

    useEffect(() => {
        if (!isAdminAuthed) {
            navigate("/admin/login");
        }
    }, [isAdminAuthed, navigate]);

    if (!isAdminAuthed) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleACChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isAC: checked }));
    };

    const [syncCity, setSyncCity] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);

    const { hostels, addHostel, deleteHostel, syncFromGoogle } = useApp();

    const handleSync = async () => {
        if (!syncCity) return toast.error("Please enter a city name");

        setIsSyncing(true);
        const toastId = toast.loading(`Syncing hostels in ${syncCity}...`);

        try {
            const result = await syncFromGoogle(syncCity);
            if (result.success) {
                toast.success(result.message, { id: toastId });
                setSyncCity("");
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (error) {
            toast.error("An unexpected error occurred during sync", { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "Property name is required";
        if (!formData.location) newErrors.location = "Location is required";
        if (!formData.price) newErrors.price = "Price is required";
        if (!formData.image) newErrors.image = "Primary image URL is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            // Data parsing
            const coordsArr = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
            const coords: [number, number] = coordsArr.length === 2 && !isNaN(coordsArr[0]) && !isNaN(coordsArr[1])
                ? [coordsArr[0], coordsArr[1]]
                : [0, 0];

            const newHostel = {
                name: formData.name,
                location: formData.location,
                price: parseInt(formData.price || "0"),
                isAC: formData.isAC,
                image: formData.image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: parseFloat(formData.rating || "5.0"),
                availableRooms: parseInt(formData.availableRooms || "0"),
                amenities: formData.amenities.split(',').map(i => i.trim()).filter(Boolean),
                roomTypes: formData.roomTypes.split(',').map(i => i.trim()).filter(Boolean),
                distanceFromCenter: formData.distanceFromCenter,
                cancellationPolicy: formData.cancellationPolicy,
                coordinates: coords,
                description: formData.description,
                images: formData.images ? formData.images.split(',').map(i => i.trim()).filter(Boolean) : [formData.image],
            };

            const success = await addHostel(newHostel);

            if (success) {
                toast.success(`${formData.name} added successfully!`);
                navigate("/search");
            } else {
                toast.error("Failed to add hostel. Please try again.");
            }
        } catch (err: any) {
            console.error("Submit Error:", err);
            toast.error("An error occurred while saving.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent mb-2">
                        Hostel Administration
                    </h1>
                    <p className="text-gray-600 focus:outline-none">
                        Add a new hostel to the platform or sync real data from OpenStreetMap.
                    </p>
                </div>

                {/* Google Sync Section */}
                <Card className="mb-8 border-indigo-200 bg-indigo-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-800">
                            <PlusCircle className="size-5" />
                            Import Real Data from OpenStreetMap
                        </CardTitle>
                        <CardDescription>
                            Enter a city (e.g., "Madurai") to pull real hostels directly from OpenStreetMap into your database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter City Name..."
                                value={syncCity}
                                onChange={(e) => {
                                    setSyncCity(e.target.value);
                                    if (errors.syncCity) setErrors(prev => ({ ...prev, syncCity: "" }));
                                }}
                                className={`bg-white border-indigo-100 ${errors.syncCity ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                disabled={isSyncing}
                            />
                            {errors.syncCity && <p className="text-xs text-red-500 mt-1">{errors.syncCity}</p>}
                            <Button
                                variant="outline"
                                className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                onClick={() => {
                                    if (!syncCity) {
                                        setErrors(prev => ({ ...prev, syncCity: "City name is required" }));
                                        return toast.error("Please enter a city name");
                                    }
                                    handleSync();
                                }}
                                disabled={isSyncing}
                            >
                                {isSyncing ? "Syncing..." : "Sync Hostels"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Manage Existing Hostels Section */}
                <Card className="mb-8 border-slate-200">
                    <CardHeader className="pb-3 bg-slate-50/50 border-b rounded-t-xl">
                        <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                            <Home className="size-5" />
                            Manage Existing Hostels
                        </CardTitle>
                        <CardDescription>
                            View and manage properties currently listed on the platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {hostels.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-500 italic">No hostels found. Add one or sync from Google.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {hostels.map((hostel) => (
                                        <div key={hostel.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="size-16 rounded overflow-hidden flex-shrink-0 bg-slate-100 border">
                                                    <img
                                                        src={hostel.image}
                                                        alt={hostel.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";
                                                        }}
                                                    />
                                                </div>
                                                <div className="min-w-0 pr-4">
                                                    <h4 className="font-bold text-slate-900 truncate">{hostel.name}</h4>
                                                    <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                                                        <MapPin className="size-3" />
                                                        {hostel.location}
                                                    </p>
                                                    <p className="text-xs font-semibold text-indigo-600 mt-1">₹{hostel.price} / night</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    if (window.confirm(`Are you sure you want to delete ${hostel.name}?`)) {
                                                        const success = await deleteHostel(hostel.id);
                                                        if (success) {
                                                            toast.success(`Deleted ${hostel.name}`);
                                                        } else {
                                                            toast.error(`Failed to delete ${hostel.name}`);
                                                        }
                                                    }
                                                }}
                                            >
                                                <Trash2 className="size-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-indigo-100">
                    <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-6 rounded-t-xl">
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                            <PlusCircle className="size-5" />
                            New Property Details
                        </CardTitle>
                        <CardDescription>
                            Fill out all the details below. For lists, separate items with commas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>Property Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={(e) => {
                                                handleChange(e);
                                                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                                            }}
                                            required
                                            placeholder="e.g. Sunrise Hostel"
                                            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className={errors.location ? "text-red-500" : ""}>Location *</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={(e) => {
                                                handleChange(e);
                                                if (errors.location) setErrors(prev => ({ ...prev, location: "" }));
                                            }}
                                            required
                                            placeholder="e.g. Old Manali, HP"
                                            className={errors.location ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price" className={errors.price ? "text-red-500" : ""}>Price (₹ per night) *</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => {
                                                handleChange(e);
                                                if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
                                            }}
                                            required
                                            placeholder="e.g. 1500"
                                            className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <Checkbox id="isAC" checked={formData.isAC} onCheckedChange={handleACChange} />
                                        <Label htmlFor="isAC" className="cursor-pointer font-medium cursor-pointer">AC Available?</Label>
                                    </div>
                                </div>
                            </div>

                            {/* Details & Amenities */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">Features & Policies</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amenities">Amenities (Comma separated)</Label>
                                        <Input id="amenities" name="amenities" value={formData.amenities} onChange={handleChange} placeholder="WiFi, AC, Food" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="roomTypes">Room Types (Comma separated)</Label>
                                        <Input id="roomTypes" name="roomTypes" value={formData.roomTypes} onChange={handleChange} placeholder="4-Bed Dorm, Private" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="distanceFromCenter">Distance from Center</Label>
                                        <Input id="distanceFromCenter" name="distanceFromCenter" value={formData.distanceFromCenter} onChange={handleChange} placeholder="2 km" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="availableRooms">Initial Available Rooms</Label>
                                        <Input id="availableRooms" name="availableRooms" type="number" value={formData.availableRooms} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                                        <Input id="cancellationPolicy" name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Description & Media */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">Description & Media</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Detailed Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                                        placeholder="Tell guests what makes this hostel unique..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="image" className={errors.image ? "text-red-500" : ""}>Primary Image URL *</Label>
                                        <div className="flex relative">
                                            <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="image"
                                                name="image"
                                                value={formData.image}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    if (errors.image) setErrors(prev => ({ ...prev, image: "" }));
                                                }}
                                                required
                                                className={`pl-9 ${errors.image ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="images">Additional Image URLs (Comma separated)</Label>
                                        <div className="flex relative">
                                            <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input id="images" name="images" value={formData.images} onChange={handleChange} className="pl-9" placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="coordinates">Coordinates (Lat, Lng)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="coordinates"
                                                name="coordinates"
                                                value={formData.coordinates}
                                                onChange={handleChange}
                                                placeholder="32.2396, 77.1887"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    const [lat, lng] = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
                                                    if (!isNaN(lat) && !isNaN(lng)) {
                                                        // This button logic is just to trigger re-renders if needed, 
                                                        // but state already updates.
                                                    }
                                                }}
                                            >
                                                <MapPin className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Map Preview for Administrative entry */}
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Map Preview (Click or drag marker to set location)</Label>
                                        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-200">
                                            <MapContainer
                                                center={(() => {
                                                    const [lat, lng] = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
                                                    return !isNaN(lat) && !isNaN(lng) ? [lat, lng] as [number, number] : [13.0475, 80.2824] as [number, number];
                                                })()}
                                                zoom={13}
                                                style={{ height: '100%', width: '100%' }}
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <LocationMarker
                                                    position={(() => {
                                                        const [lat, lng] = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
                                                        return !isNaN(lat) && !isNaN(lng) ? [lat, lng] as [number, number] : [13.0475, 80.2824] as [number, number];
                                                    })()}
                                                    setPosition={(pos) => {
                                                        setFormData(prev => ({ ...prev, coordinates: `${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}` }));
                                                    }}
                                                />
                                            </MapContainer>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rating">Default Rating</Label>
                                        <Input id="rating" name="rating" type="number" step="0.1" max="5.0" min="1.0" value={formData.rating} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 py-6 px-12 text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-1"
                                >
                                    {isSubmitting ? "Creating..." : "Save Property"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
