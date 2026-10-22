import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Hostel } from '../context/AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Star, Search, X, Navigation, MapPin, Wifi, Phone, Globe, Loader2, RefreshCw } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { fetchRealHostels, resolveRegion, RealHostel } from '../services/overpassService';

// ─── Icons ────────────────────────────────────────────────────────────────────

// StayNest hostel pin — indigo gradient
const staynestIcon = L.divIcon({
  html: `<div style="
    width:36px;height:36px;background:linear-gradient(135deg,#4f46e5,#7c3aed);
    border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    border:3px solid white;box-shadow:0 4px 12px rgba(79,70,229,.5);
    display:flex;align-items:center;justify-content:center">
    <div style="transform:rotate(45deg);width:10px;height:10px;
      background:white;border-radius:50%"></div>
  </div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Real / OSM hostel pin — teal
const osmIcon = L.divIcon({
  html: `<div style="
    width:30px;height:30px;background:linear-gradient(135deg,#0d9488,#0891b2);
    border-radius:50%;border:2.5px solid white;
    box-shadow:0 3px 8px rgba(13,148,136,.45);
    display:flex;align-items:center;justify-content:center">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// User location pin
const userIcon = L.divIcon({
  html: `<div style="
    width:20px;height:20px;background:#3b82f6;border-radius:50%;
    border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,.3)">
  </div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// ─── Map auto-updater ─────────────────────────────────────────────────────────
function MapController({
  hostels,
  realHostels,
  searchResult,
  userLocation,
}: {
  hostels: Hostel[];
  realHostels: RealHostel[];
  searchResult: [number, number] | null;
  userLocation: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    const allCoords: [number, number][] = [
      ...hostels.map((h) => h.coordinates),
      ...realHostels.map((h) => h.coordinates),
    ];

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1 });
    } else if (searchResult) {
      map.setView(searchResult, 13, { animate: true, duration: 1 });
    } else if (userLocation) {
      map.setView(userLocation, 13, { animate: true, duration: 1 });
    }
  }, [hostels, realHostels, searchResult, userLocation, map]);

  return null;
}

// ─── Navigate helper ──────────────────────────────────────────────────────────
function openNavigation(lat: number, lon: number, name: string) {
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const encoded = encodeURIComponent(name);
  if (isMobile) {
    // Try native maps first
    window.open(`geo:${lat},${lon}?q=${lat},${lon}(${encoded})`, '_blank');
  } else {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=${encoded}`,
      '_blank'
    );
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface MapViewProps {
  hostels: Hostel[];
  center?: [number, number];
  zoom?: number;
  searchedLocation?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MapView({
  hostels,
  center = [11.0, 78.5], // Tamil Nadu centre
  zoom = 7,
  searchedLocation,
}: MapViewProps) {
  const [mapSearch, setMapSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<[number, number] | null>(null);

  // Real hostel state
  const [realHostels, setRealHostels] = useState<RealHostel[]>([]);
  const [isFetchingReal, setIsFetchingReal] = useState(false);
  const [realError, setRealError] = useState<string | null>(null);
  const [showReal, setShowReal] = useState(true);
  const [currentRegion, setCurrentRegion] = useState('Tamil Nadu');

  // User location
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // ── Fetch real hostels ──────────────────────────────────────────────────
  const loadRealHostels = useCallback(async (region: string) => {
    setIsFetchingReal(true);
    setRealError(null);
    try {
      const data = await fetchRealHostels(region);
      setRealHostels(data);
      setCurrentRegion(region);
    } catch (err) {
      console.error('Overpass error:', err);
      setRealError('Could not fetch live data. Check your connection.');
    } finally {
      setIsFetchingReal(false);
    }
  }, []);

  // Auto-load when searchedLocation changes
  useEffect(() => {
    const region = resolveRegion(searchedLocation || 'Tamil Nadu');
    loadRealHostels(region);
  }, [searchedLocation, loadRealHostels]);

  // Geocode searchedLocation (from homepage search bar)
  useEffect(() => {
    if (!searchedLocation) { setSearchResult(null); return; }
    const run = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchedLocation + ', India')}&limit=1`
        );
        const data = await res.json();
        if (data[0]) setSearchResult([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } catch { /* silent */ }
    };
    run();
  }, [searchedLocation]);

  // ── Map search ──────────────────────────────────────────────────────────
  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearch.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch)}&countrycodes=in&limit=1`
      );
      const data = await res.json();
      if (data[0]) {
        setSearchResult([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        const region = resolveRegion(mapSearch);
        loadRealHostels(region);
      }
    } catch { /* silent */ } finally {
      setIsSearching(false);
    }
  };

  // ── Geolocate user ──────────────────────────────────────────────────────
  const locateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 8000 }
    );
  };

  const totalOnMap = hostels.length + (showReal ? realHostels.length : 0);

  return (
    <div className="w-full h-full relative shadow-sm bg-slate-50">

      {/* ── Top Search Bar ─────────────────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-3">
        <form onSubmit={handleMapSearch} className="relative drop-shadow-2xl">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          </div>
          <Input
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Search city or area to load live hostels…"
            className="pl-9 pr-10 h-11 bg-white/95 backdrop-blur-sm border-0 rounded-xl shadow-xl focus-visible:ring-indigo-500 font-medium text-slate-900 text-sm"
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

      {/* ── Live Data Control Panel ────────────────────────────────────── */}
      <div className="absolute top-[72px] right-3 z-[1000] flex flex-col gap-2">

        {/* Layer toggle pill */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-2 flex flex-col gap-1.5 text-xs">
          <p className="text-slate-500 font-semibold uppercase tracking-wider px-1">Layers</p>

          <button
            onClick={() => setShowReal(!showReal)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
              showReal ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 shrink-0" />
            Live (OSM)
            {isFetchingReal ? (
              <Loader2 className="size-3 animate-spin ml-auto" />
            ) : (
              <span className="ml-auto font-bold">{realHostels.length}</span>
            )}
          </button>

          <button
            onClick={() => {}} // always shown
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700"
          >
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0" />
            StayNest
            <span className="ml-auto font-bold">{hostels.length}</span>
          </button>

          <div className="h-px bg-slate-100 my-0.5" />

          <p className="text-center text-slate-400 font-medium px-1">{totalOnMap} total</p>
        </div>

        {/* Locate me */}
        <button
          onClick={locateMe}
          disabled={isLocating}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-2.5 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50"
          title="Find my location"
        >
          {isLocating ? (
            <Loader2 className="size-4 text-indigo-600 animate-spin" />
          ) : (
            <Navigation className="size-4 text-indigo-600" />
          )}
        </button>

        {/* Refresh live data */}
        <button
          onClick={() => loadRealHostels(currentRegion)}
          disabled={isFetchingReal}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-2.5 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50"
          title="Refresh live hostel data"
        >
          <RefreshCw className={`size-4 text-teal-600 ${isFetchingReal ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Status Bar ────────────────────────────────────────────────── */}
      {(isFetchingReal || realError) && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[1000]">
          <div className={`px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 ${
            realError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
          }`}>
            {isFetchingReal ? (
              <><Loader2 className="size-3.5 animate-spin" /> Fetching live hostel data from OpenStreetMap…</>
            ) : (
              <>{realError}</>
            )}
          </div>
        </div>
      )}

      {/* ── Map ───────────────────────────────────────────────────────── */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController
          hostels={hostels}
          realHostels={showReal ? realHostels : []}
          searchResult={searchResult}
          userLocation={userLocation}
        />

        {/* Map tiles — clean CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* User location dot */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={300}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1 }}
            />
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-sm font-semibold text-slate-800 p-1">📍 You are here</div>
              </Popup>
            </Marker>
          </>
        )}

        {/* ── StayNest hostels (indigo pins) ─────────────────────────── */}
        {hostels.map((hostel) => (
          <Marker key={hostel.id} position={hostel.coordinates} icon={staynestIcon}>
            <Popup className="staynest-popup" minWidth={260} maxWidth={300}>
              <div className="flex flex-col overflow-hidden rounded-xl !m-0 !p-0">
                {/* Image */}
                <div className="h-28 w-full relative">
                  <ImageWithFallback src={hostel.image} alt={hostel.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <Badge className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white border-0">StayNest</Badge>
                  </div>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="size-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-800">{hostel.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-bold text-sm text-slate-900 leading-tight mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                    {hostel.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <MapPin className="size-3 shrink-0" />{hostel.location}
                  </p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {hostel.amenities.slice(0, 3).map((a) => (
                      <span key={a} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-indigo-600 text-sm">
                      ₹{hostel.price}<span className="text-xs text-slate-400 font-normal">/night</span>
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openNavigation(hostel.coordinates[0], hostel.coordinates[1], hostel.name)}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 font-medium transition-colors"
                      >
                        <Navigation className="size-3" />
                        Navigate
                      </button>
                      <Link to={`/hostel/${hostel.id}`}>
                        <Button size="sm" className="h-7 text-xs rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 border-0 text-white px-2.5">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── Real / OSM hostels (teal pins) ─────────────────────────── */}
        {showReal && realHostels.map((hostel) => (
          <Marker key={hostel.id} position={hostel.coordinates} icon={osmIcon}>
            <Popup minWidth={230} maxWidth={280}>
              <div className="p-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                      {hostel.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 shrink-0" />
                      {hostel.location || 'India'}
                    </p>
                  </div>
                  <Badge className="text-[10px] shrink-0 bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-50">
                    Live · OSM
                  </Badge>
                </div>

                {/* Address */}
                {hostel.address && (
                  <p className="text-xs text-slate-500 mb-2">📍 {hostel.address}</p>
                )}

                {/* Contact row */}
                <div className="flex flex-col gap-1.5 mb-3">
                  {hostel.phone && (
                    <a
                      href={`tel:${hostel.phone}`}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
                    >
                      <Phone className="size-3" />{hostel.phone}
                    </a>
                  )}
                  {hostel.website && (
                    <a
                      href={hostel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline truncate"
                    >
                      <Globe className="size-3 shrink-0" />
                      <span className="truncate">{hostel.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {hostel.internet && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Wifi className="size-3" />WiFi: {hostel.internet}
                    </p>
                  )}
                </div>

                {/* Navigate CTA */}
                <button
                  onClick={() => openNavigation(hostel.coordinates[0], hostel.coordinates[1], hostel.name)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Navigation className="size-3.5" />
                  Navigate with Google Maps
                </button>

                <p className="text-[10px] text-slate-400 text-center mt-1.5">
                  Data from OpenStreetMap · crowd-sourced
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Popup styles ───────────────────────────────────────────────── */}
      <style>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 0.875rem;
          box-shadow: 0 20px 40px -8px rgba(0,0,0,.18), 0 8px 16px -4px rgba(0,0,0,.1);
          border: 1px solid rgba(0,0,0,.06);
        }
        .leaflet-popup-content { margin: 0; width: 270px !important; }
        .leaflet-popup-tip-container { margin-top: -1px; }
        .leaflet-control-zoom { display: none; }
      `}</style>
    </div>
  );
}
