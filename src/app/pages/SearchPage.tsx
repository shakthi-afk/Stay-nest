import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { hostels } from "../data/hostels";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { MapPin, Star, Heart, Filter, SlidersHorizontal, Map, List } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { MapView } from "../components/MapView";

export function SearchPage() {
  const navigate = useNavigate();
  const { compareList, addToCompare, removeFromCompare, wishlist, addToWishlist, removeFromWishlist } = useApp();

  // Filter states
  const [priceRange, setPriceRange] = useState([1000, 10000]);
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
  }, [priceRange, acFilter, availableOnly, selectedRoomTypes, minRating, selectedAmenities, sortBy]);

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
          min={1000}
          max={10000}
          step={100}
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)' }}>Search Results</h1>
            <p className="text-slate-500 mt-1">{filteredHostels.length} hostels found</p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] rounded-xl border-slate-200 hidden md:flex">
                <SlidersHorizontal className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "list"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <List className="size-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "map"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <Map className="size-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>

            {/* Mobile Filters */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" className="rounded-xl">
                  <Filter className="size-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <Card className="sticky top-20 rounded-2xl border-0 shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {compareList.length > 0 && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-2xl flex items-center justify-between border border-indigo-100">
                <p className="font-medium text-indigo-700">
                  {compareList.length} hostel(s) selected for comparison
                </p>
                <Button onClick={() => navigate("/compare")} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600">
                  Compare Now
                </Button>
              </div>
            )}

            {viewMode === "map" ? (
              <div className="w-full h-[calc(100vh-250px)] min-h-[600px] sticky top-20">
                <MapView hostels={filteredHostels} />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredHostels.map((hostel) => (
                  <Card key={hostel.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-2xl border-0 shadow-md hover:-translate-y-0.5">
                    <div className="md:flex">
                      {/* Image — only wishlist button overlays */}
                      <div className="relative md:w-56 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                        <ImageWithFallback
                          src={hostel.image}
                          alt={hostel.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => toggleWishlist(hostel.id)}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white hover:scale-110 transition-all duration-300"
                        >
                          <Heart
                            className={`size-5 ${wishlist.includes(hostel.id) ? "fill-rose-500 text-rose-500" : "text-slate-500"
                              }`}
                          />
                        </button>
                      </div>

                      {/* All details in the card body */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="truncate">{hostel.name}</CardTitle>
                            <Badge className="flex-shrink-0 bg-indigo-50 text-indigo-700 border-0 font-semibold text-xs">
                              {hostel.isAC ? "❄️ AC" : "🌿 Non-AC"}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="size-4 flex-shrink-0" />
                            {hostel.location}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 pb-2">
                          {/* Rating */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center gap-1 bg-amber-50 rounded-full px-2.5 py-0.5">
                              <Star className="size-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-amber-700 text-sm">{hostel.rating}</span>
                            </div>
                            <span className="text-slate-500 text-sm">
                              ({hostel.reviews.length} reviews)
                            </span>
                          </div>

                          {/* Availability */}
                          <div className="mb-3">
                            {hostel.availableRooms > 0 ? (
                              hostel.availableRooms <= 3 ? (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                  Only {hostel.availableRooms} rooms left
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                  {hostel.availableRooms} rooms available
                                </Badge>
                              )
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                Sold Out
                              </Badge>
                            )}
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {hostel.amenities.slice(0, 3).map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>₹{hostel.price}</span>
                            <span className="text-sm text-slate-400">/night</span>
                          </div>
                        </CardContent>

                        <CardFooter className="flex gap-2 pt-0">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`compare-${hostel.id}`}
                              checked={compareList.includes(hostel.id)}
                              onCheckedChange={() => toggleCompare(hostel.id)}
                              disabled={!compareList.includes(hostel.id) && compareList.length >= 4}
                            />
                            <Label htmlFor={`compare-${hostel.id}`} className="text-sm cursor-pointer">
                              Compare
                            </Label>
                          </div>
                          <Button
                            className="ml-auto rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
                            onClick={() => navigate(`/hostel/${hostel.id}`)}
                            disabled={hostel.availableRooms === 0}
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {filteredHostels.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-600 text-lg">
                  No hostels found matching your filters. Try adjusting your search criteria.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
