import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { hostels } from "../data/hostels";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { MapPin, Star, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ComparePage() {
  const navigate = useNavigate();
  const { compareList, removeFromCompare } = useApp();

  const comparedHostels = hostels.filter((hostel) => compareList.includes(hostel.id));

  if (comparedHostels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <h2 className="mb-4">No Hostels to Compare</h2>
          <p className="text-gray-600 mb-6">
            Select hostels from the search page to compare them side by side.
          </p>
          <Button onClick={() => navigate("/search")}>
            Go to Search
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1>Compare Hostels</h1>
          <p className="text-gray-600">Side by side comparison of {comparedHostels.length} hostels</p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Feature</TableHead>
                {comparedHostels.map((hostel) => (
                  <TableHead key={hostel.id} className="text-center">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(hostel.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Images */}
              <TableRow>
                <TableCell></TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <ImageWithFallback
                      src={hostel.image}
                      alt={hostel.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Hostel Name */}
              <TableRow>
                <TableCell>Hostel Name</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <p>{hostel.name}</p>
                  </TableCell>
                ))}
              </TableRow>

              {/* Location */}
              <TableRow>
                <TableCell>Location</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {hostel.location}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Price */}
              <TableRow>
                <TableCell>Price per Night</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <p className="text-2xl">₹{hostel.price}</p>
                  </TableCell>
                ))}
              </TableRow>

              {/* AC/Non-AC */}
              <TableRow>
                <TableCell>AC / Non-AC</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <Badge>{hostel.isAC ? "AC" : "Non-AC"}</Badge>
                  </TableCell>
                ))}
              </TableRow>

              {/* Available Rooms */}
              <TableRow>
                <TableCell>Available Rooms</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    {hostel.availableRooms > 0 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {hostel.availableRooms} rooms
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Sold Out
                      </Badge>
                    )}
                  </TableCell>
                ))}
              </TableRow>

              {/* Rating */}
              <TableRow>
                <TableCell>Rating</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span>{hostel.rating}</span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Amenities */}
              <TableRow>
                <TableCell>Amenities</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <div className="flex flex-wrap gap-2">
                      {hostel.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Room Types */}
              <TableRow>
                <TableCell>Room Types</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    {hostel.roomTypes.join(", ")}
                  </TableCell>
                ))}
              </TableRow>

              {/* Distance from Center */}
              <TableRow>
                <TableCell>Distance from City Center</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    {hostel.distanceFromCenter}
                  </TableCell>
                ))}
              </TableRow>

              {/* Cancellation Policy */}
              <TableRow>
                <TableCell>Cancellation Policy</TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <p className="text-sm">{hostel.cancellationPolicy}</p>
                  </TableCell>
                ))}
              </TableRow>

              {/* Book Now */}
              <TableRow>
                <TableCell></TableCell>
                {comparedHostels.map((hostel) => (
                  <TableCell key={hostel.id}>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/hostel/${hostel.id}`)}
                      disabled={hostel.availableRooms === 0}
                    >
                      View Details
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-6">
          {comparedHostels.map((hostel) => (
            <Card key={hostel.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{hostel.name}</CardTitle>
                  <button
                    onClick={() => removeFromCompare(hostel.id)}
                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageWithFallback
                  src={hostel.image}
                  alt={hostel.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {hostel.location}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-xl">₹{hostel.price}/night</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <Badge>{hostel.isAC ? "AC" : "Non-AC"}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span>{hostel.rating}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Available Rooms</p>
                    <p>{hostel.availableRooms > 0 ? `${hostel.availableRooms} rooms` : "Sold Out"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p>{hostel.distanceFromCenter}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {hostel.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Room Types</p>
                  <p>{hostel.roomTypes.join(", ")}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cancellation Policy</p>
                  <p className="text-sm">{hostel.cancellationPolicy}</p>
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => navigate(`/hostel/${hostel.id}`)}
                  disabled={hostel.availableRooms === 0}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
