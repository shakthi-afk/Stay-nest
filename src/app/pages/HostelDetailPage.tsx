import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { MapPin, Star, Heart, Wifi, Car, UtensilsCrossed, Shirt, Shield, Users, Check } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function HostelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hostels, wishlist, addToWishlist, removeFromWishlist, setShowLoginModal, isLoggedIn } = useApp();
  const [selectedRoomType, setSelectedRoomType] = useState<"ac" | "non-ac">("ac");

  const hostel = hostels.find((h) => h.id === id);

  if (!hostel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <h2 className="mb-4">Hostel Not Found</h2>
          <Button onClick={() => navigate("/search")}>
            Back to Search
          </Button>
        </Card>
      </div>
    );
  }

  const toggleWishlist = () => {
    if (wishlist.includes(hostel.id)) {
      removeFromWishlist(hostel.id);
    } else {
      addToWishlist(hostel.id);
    }
  };

  const handleBookNow = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigate(`/booking/${hostel.id}?roomType=${selectedRoomType}`);
  };

  const amenityIcons: { [key: string]: any } = {
    WiFi: Wifi,
    Parking: Car,
    Food: UtensilsCrossed,
    Laundry: Shirt,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {hostel.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[500px] rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={image}
                      alt={`${hostel.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{hostel.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <MapPin className="size-5" />
                      {hostel.location}
                    </CardDescription>
                  </div>
                  <button
                    onClick={toggleWishlist}
                    className="bg-gray-100 rounded-full p-3 hover:bg-gray-200"
                  >
                    <Heart
                      className={`size-6 ${wishlist.includes(hostel.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="size-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg">{hostel.rating}</span>
                    <span className="text-gray-600">
                      ({hostel.rating >= 4.5 ? "Excellent" : hostel.rating >= 4 ? "Very Good" : "Good"})
                    </span>
                  </div>
                  <Badge className="text-base py-1 px-3">
                    {hostel.isAC ? "AC Available" : "Non-AC"}
                  </Badge>
                  {hostel.availableRooms > 0 ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-base py-1 px-3">
                      {hostel.availableRooms} rooms available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-base py-1 px-3">
                      Sold Out
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700">{hostel.description}</p>
              </CardContent>
            </Card>

            {/* Room Options */}
            <Card>
              <CardHeader>
                <CardTitle>Room Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hostel.isAC && (
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedRoomType === "ac" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                    onClick={() => setSelectedRoomType("ac")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p>AC Room</p>
                        <p className="text-sm text-gray-600">Air-conditioned rooms with modern amenities</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl">₹{hostel.price}</p>
                        <p className="text-sm text-gray-600">/night</p>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedRoomType === "non-ac" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  onClick={() => setSelectedRoomType("non-ac")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Non-AC Room</p>
                      <p className="text-sm text-gray-600">Comfortable rooms with natural ventilation</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl">₹{Math.round(hostel.price * 0.7)}</p>
                      <p className="text-sm text-gray-600">/night</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="size-4" />
                  <span>Available room types: {hostel.roomTypes.join(", ")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hostel.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={amenity} className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                          <Icon className="size-5" />
                        </div>
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hostel.reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
                ) : (
                  hostel.reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p>{review.userName}</p>
                        <div className="flex items-center gap-1">
                          <Star className="size-4 fill-yellow-400 text-yellow-400" />
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-sm text-gray-500 mt-1">{new Date(review.date).toLocaleDateString()}</p>
                      {review.id !== hostel.reviews[hostel.reviews.length - 1].id && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl">
                    ₹{selectedRoomType === "ac" ? hostel.price : Math.round(hostel.price * 0.7)}
                  </p>
                  <p className="text-gray-600">/night</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Room Type</span>
                    <Badge>{selectedRoomType === "ac" ? "AC" : "Non-AC"}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Distance from Center</span>
                    <span>{hostel.distanceFromCenter}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm">
                    <Shield className="inline size-4 mr-1" />
                    <span className="text-gray-700">{hostel.cancellationPolicy}</span>
                  </p>
                </div>

                <Button
                  className="w-full h-12 text-lg"
                  onClick={handleBookNow}
                  disabled={hostel.availableRooms === 0}
                >
                  {hostel.availableRooms === 0 ? "Sold Out" : "Book Now"}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  You won't be charged yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Book Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-2xl">
              ₹{selectedRoomType === "ac" ? hostel.price : Math.round(hostel.price * 0.7)}
              <span className="text-sm text-gray-600">/night</span>
            </p>
          </div>
          <Button onClick={handleBookNow} disabled={hostel.availableRooms === 0}>
            {hostel.availableRooms === 0 ? "Sold Out" : "Book Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
