import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Hostel } from '../context/AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Star } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map center changes
function MapCenterUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), {
            animate: true,
            duration: 1
        });
    }, [center, map]);
    return null;
}

interface MapViewProps {
    hostels: Hostel[];
    center?: [number, number];
    zoom?: number;
}

export function MapView({ hostels, center = [13.0475, 80.2824], zoom = 6 }: MapViewProps) {
    // If there are hostels, set center to the first one, else use default (Chennai)
    const mapCenter = hostels.length > 0 ? hostels[0].coordinates : center;

    return (
        <div className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%', minHeight: '600px' }}
            >
                <MapCenterUpdater center={mapCenter} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {hostels.map((hostel) => (
                    <Marker key={hostel.id} position={hostel.coordinates}>
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
