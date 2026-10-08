import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Hostel } from '../context/AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Star, Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { useState } from 'react';

// Custom Marker Icon based on the screenshot (Dark blue circle with white border)
const customIcon = L.divIcon({
    html: `<div class="w-8 h-8 bg-[#003580] rounded-full border-2 border-white flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2">
             <div class="w-2 h-2 bg-white rounded-full"></div>
           </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Component to handle map center changes and bounds
function MapViewUpdater({ hostels, searchResult }: { hostels: Hostel[], searchResult: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (hostels.length > 0) {
            if (hostels.length === 1) {
                map.setView(hostels[0].coordinates, 13, {
                    animate: true,
                    duration: 1
                });
            } else {
                const bounds = L.latLngBounds(hostels.map(h => h.coordinates));
                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 15,
                    animate: true,
                    duration: 1
                });
            }
            return;
        }

        if (searchResult) {
            map.setView(searchResult, 13, {
                animate: true,
                duration: 1
            });
        }
    }, [hostels, map, searchResult]);

    return null;
}

interface MapViewProps {
    hostels: Hostel[];
    center?: [number, number];
    zoom?: number;
    searchedLocation?: string;
}

export function MapView({ hostels, center = [13.0475, 80.2824], zoom = 6, searchedLocation }: MapViewProps) {
    const [mapSearch, setMapSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<[number, number] | null>(null);

    // Geocode searched location from homepage or search bar
    useEffect(() => {
        if (!searchedLocation) {
            setSearchResult(null);
            return;
        }

        const geocodeSearchedLocation = async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchedLocation + ", India")}&limit=1`);
                const data = await response.json();
                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    setSearchResult([parseFloat(lat), parseFloat(lon)]);
                }
            } catch (err) {
                console.error("Geocoding search location error in MapView:", err);
            }
        };

        geocodeSearchedLocation();
    }, [searchedLocation]);

    const handleMapSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mapSearch) return;

        setIsSearching(true);
        try {
            // Use Nominatim for free geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setSearchResult([parseFloat(lat), parseFloat(lon)]);
            }
        } catch (err) {
            console.error("Geocoding error", err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="w-full h-full relative group shadow-sm bg-slate-50">
            {/* Search on map overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
                <form onSubmit={handleMapSearch} className="relative drop-shadow-2xl">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search className="size-4" />
                    </div>
                    <Input
                        value={mapSearch}
                        onChange={(e) => setMapSearch(e.target.value)}
                        placeholder="Search on map"
                        className="pl-10 pr-10 h-10 bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-lg focus-visible:ring-indigo-600 transition-all font-medium text-slate-900"
                    />
                    {mapSearch && (
                        <button
                            type="button"
                            onClick={() => setMapSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </form>
            </div>

            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // Hide default to place it elsewhere or just for cleaner look
            >
                <MapViewUpdater hostels={hostels} searchResult={searchResult} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {hostels.map((hostel) => (
                    <Marker
                        key={hostel.id}
                        position={hostel.coordinates}
                        icon={customIcon}
                    >
                        <Popup className="staynest-popup" minWidth={250} maxWidth={300}>
                            <div className="flex flex-col gap-2 overflow-hidden rounded-xl border-0 !m-0 !p-0">
                                <div className="h-32 w-full relative">
                                    <ImageWithFallback
                                        src={hostel.image}
                                        alt={hostel.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                        <Star className="size-3 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-bold text-slate-800">{hostel.rating}</span>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-sm text-slate-900 leading-tight mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                                        {hostel.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-3 line-clamp-1">{hostel.location}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <p className="font-semibold text-indigo-600">
                                            ₹{hostel.price}<span className="text-xs text-slate-500 font-normal">/night</span>
                                        </p>
                                        <Link to={`/hostel/${hostel.id}`}>
                                            <Button size="sm" className="h-7 text-xs rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 border-0 text-white">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Adding custom styles for leaflet popup to match our theme */}
            <style>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
          width: 250px !important;
        }
        .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>
        </div>
    );
}
