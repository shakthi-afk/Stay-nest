import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { MapPin, Star, Heart, Filter, SlidersHorizontal, Map, List, Search } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { MapView } from "../components/MapView";

export function SearchPage() {
  const navigate = useNavigate();
  const { hostels, searchParams, setSearchParams, compareList, addToCompare, removeFromCompare, wishlist, addToWishlist, removeFromWishlist, syncFromGoogle, isLoading } = useApp();
  const [localLocation, setLocalLocation] = useState(searchParams.location);
  const [isSyncing, setIsSyncing] = useState(false);
  const [attemptedSyncs, setAttemptedSyncs] = useState<string[]>([]);

  // Filter states
  const [priceRange, setPriceRange] = useState([300, 10000]);

  // Auto-sync missing locations from OpenStreetMap
  useState(() => {
    // Basic init if needed
  });

  useEffect(() => {
    const triggerSync = async () => {
      const city = searchParams.location;
      if (!city || isLoading || isSyncing || attemptedSyncs.includes(city.toLowerCase())) return;

      const searchLoc = city.toLowerCase();
      // Check if we already have hostels for this location in our database
      const hasHostelsForLocation = hostels.some(
        (h) =>
          h.location.toLowerCase().includes(searchLoc) ||
          h.name.toLowerCase().includes(searchLoc)
      );

      if (!hasHostelsForLocation) {
        setIsSyncing(true);
        setAttemptedSyncs((prev) => [...prev, searchLoc]);
        try {
          await syncFromGoogle(city);
        } catch (err) {
          console.error("Auto-sync error:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    triggerSync();
  }, [searchParams.location, hostels, isLoading, syncFromGoogle, attemptedSyncs, isSyncing]);
  const [acFilter, setAcFilter] = useState<"all" | "ac" | "non-ac">("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("price-low");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const allAmenities = ["WiFi", "Parking", "Food", "Laundry"];
  const roomTypes = ["Single", "Double", "Dormitory"];

  // Filter and sort hostels
  const filteredHostels = useMemo(() => {
    let filtered = hostels.filter((hostel) => {
      // Price filter
      if (hostel.price < priceRange[0] || hostel.price > priceRange[1]) return false;

      // AC filter
      if (acFilter === "ac" && !hostel.isAC) return false;
      if (acFilter === "non-ac" && hostel.isAC) return false;

      // Availability filter
      if (availableOnly && hostel.availableRooms === 0) return false;

      // Room type filter
      if (selectedRoomTypes.length > 0) {
        if (!hostel.roomTypes.some((type) => selectedRoomTypes.includes(type))) return false;
      }

      // Rating filter
      if (hostel.rating < minRating) return false;

      // Amenities filter
      if (selectedAmenities.length > 0) {
        if (!selectedAmenities.every((amenity) => hostel.amenities.includes(amenity))) return false;
      }

      // Location filter
      if (searchParams.location) {
        const searchLoc = searchParams.location.toLowerCase();
        const hostelLoc = hostel.location.toLowerCase();
        const hostelName = hostel.name.toLowerCase();
        if (!hostelLoc.includes(searchLoc) && !hostelName.includes(searchLoc)) return false;
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "availability":
        filtered.sort((a, b) => b.availableRooms - a.availableRooms);
        break;
    }

    return filtered;
  }, [priceRange, acFilter, availableOnly, selectedRoomTypes, minRating, selectedAmenities, sortBy, hostels, searchParams.location]);

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ ...searchParams, location: localLocation });
  };

  const toggleRoomType = (type: string) => {
    setSelectedRoomTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleCompare = (hostelId: string) => {
    if (compareList.includes(hostelId)) {
      removeFromCompare(hostelId);
    } else {
      addToCompare(hostelId);
    }
  };

  const toggleWishlist = (hostelId: string) => {
    if (wishlist.includes(hostelId)) {
      removeFromWishlist(hostelId);
    } else {
      addToWishlist(hostelId);
    }
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="mb-4 block">
          Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
        </Label>
        <Slider
          min={300}
          max={10000}
          step={50}
          value={priceRange}
          onValueChange={setPriceRange}
        />
      </div>

      {/* AC Filter */}
      <div>
        <Label className="mb-3 block">AC / Non-AC</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ac-all"
              checked={acFilter === "all"}
              onCheckedChange={() => setAcFilter("all")}
            />
            <Label htmlFor="ac-all" className="cursor-pointer">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ac-only"
              checked={acFilter === "ac"}
              onCheckedChange={() => setAcFilter("ac")}
            />
            <Label htmlFor="ac-only" className="cursor-pointer">AC Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="non-ac"
              checked={acFilter === "non-ac"}
              onCheckedChange={() => setAcFilter("non-ac")}
            />
            <Label htmlFor="non-ac" className="cursor-pointer">Non-AC Only</Label>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="available"
            checked={availableOnly}
            onCheckedChange={(checked) => setAvailableOnly(!!checked)}
          />
          <Label htmlFor="available" className="cursor-pointer">Available Now</Label>
        </div>
      </div>

      {/* Room Types */}
      <div>
        <Label className="mb-3 block">Room Type</Label>
        <div className="space-y-2">
          {roomTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={selectedRoomTypes.includes(type)}
                onCheckedChange={() => toggleRoomType(type)}
              />
              <Label htmlFor={type} className="cursor-pointer">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <Label className="mb-3 block">Minimum Rating</Label>
        <Select value={minRating.toString()} onValueChange={(val) => setMinRating(Number(val))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Amenities */}
      <div>
        <Label className="mb-3 block">Amenities</Label>
        <div className="space-y-2">
          {allAmenities.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <Label htmlFor={amenity} className="cursor-pointer">{amenity}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Search Header / Top Bar */}
      <header className="flex-shrink-0 border-b border-slate-200 bg-white z-10 p-4">
        <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
              {searchParams.location || "All India"}: {filteredHostels.length} properties found
            </h1>
            <button className="text-indigo-600 text-sm font-medium hover:underline">Select dates</button>
          </div>

          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-lg h-10 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                  <Filter className="size-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[350px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 overflow-y-auto max-h-[calc(100vh-100px)] pr-4">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] rounded-lg border-slate-200 h-10">
                <SlidersHorizontal className="size-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Our top picks</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
              </SelectContent>
            </Select>

            <form onSubmit={handleLocalSearch} className="relative group flex-1 max-w-[300px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Change location..."
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
                className="pl-9 rounded-lg border-slate-200 h-10"
              />
              <Button type="submit" size="sm" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg h-8">
                <Search className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Split Screen Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Results List */}
        <section className="w-full lg:w-[45%] xl:w-[40%] overflow-y-auto p-4 lg:pr-2 bg-white custom-scrollbar">
          {compareList.length > 0 && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl flex items-center justify-between border border-indigo-100 sticky top-0 z-10 shadow-sm">
              <p className="font-medium text-indigo-700 text-sm">
                {compareList.length} selected for comparison
              </p>
              <Button size="sm" onClick={() => navigate("/compare")} className="rounded-lg bg-indigo-600">
                Compare Now
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {isSyncing ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-slate-900">Syncing real hostels...</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                  We are fetching real hostel properties and their locations in "{searchParams.location}" from OpenStreetMap.
                </p>
              </div>
            ) : (
              <>
                {filteredHostels.map((hostel) => (
                  <Card key={hostel.id} className="overflow-hidden group border border-slate-200 hover:shadow-md transition-all duration-300 rounded-xl flex h-[180px] cursor-pointer" onClick={() => navigate(`/hostel/${hostel.id}`)}>
                    <div className="w-1/3 h-full relative flex-shrink-0">
                      <ImageWithFallback
                        src={hostel.image}
                        alt={hostel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(hostel.id);
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform z-10"
                      >
                        <Heart
                          className={`size-4 ${wishlist.includes(hostel.id) ? "fill-rose-500 text-rose-500" : "text-slate-400"
                            }`}
                        />
                      </button>
                    </div>

                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-lg text-slate-900 truncate leading-tight hover:text-indigo-600 transition-colors">
                            {hostel.name}
                          </h3>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-900 leading-none">
                                  {hostel.rating >= 4.5 ? "Excellent" : hostel.rating >= 4 ? "Very Good" : hostel.rating >= 3 ? "Good" : "Fair"}
                                </p>
                                <p className="text-[10px] text-slate-500">{hostel.rating.toFixed(1)} rating</p>
                              </div>
                              <div className="bg-indigo-700 text-white font-bold rounded-t-lg rounded-br-lg px-2 py-1 text-sm">
                                {hostel.rating.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="size-3" />
                          {hostel.location}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hostel.amenities.slice(0, 2).map((a) => (
                            <Badge key={a} variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-100 text-slate-600 border-0">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          {hostel.availableRooms <= 3 && hostel.availableRooms > 0 && (
                            <p className="text-[10px] text-rose-600 font-bold mb-1">
                              Only {hostel.availableRooms} rooms left!
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 leading-none mb-1">Price per night</p>
                          <p className="text-xl font-bold text-slate-900 leading-none">₹{hostel.price}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Includes taxes & fees</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {filteredHostels.length === 0 && (
                  <div className="text-center py-20">
                    <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Search className="size-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No properties found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                      Try adjusting your filters or searching for a different location.
                    </p>
                    <Button variant="link" className="text-indigo-600 mt-2" onClick={() => {
                      setPriceRange([300, 10000]);
                      setSearchParams({ ...searchParams, location: "" });
                      setLocalLocation("");
                    }}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Right Side: Sticky Map Container */}
        <section className="hidden lg:block lg:flex-1 h-full bg-slate-100 border-l border-slate-200">
          <MapView hostels={filteredHostels} searchedLocation={searchParams.location} />
        </section>

        {/* Floating Toggle for Mobile */}
        <button
          onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 font-bold"
        >
          {viewMode === "list" ? (
            <><Map className="size-5" /> Map</>
          ) : (
            <><List className="size-5" /> List</>
          )}
        </button>

        {/* Mobile Map Overlay */}
        {viewMode === "map" && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white pt-[140px]">
            <MapView hostels={filteredHostels} searchedLocation={searchParams.location} />
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
