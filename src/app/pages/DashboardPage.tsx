import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Calendar, MapPin, User, Mail, Heart } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function DashboardPage() {
  const navigate = useNavigate();
  const { hostels, isLoggedIn, user, bookings, wishlist, setShowLoginModal } = useApp();

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      navigate("/");
    }
  }, [isLoggedIn, setShowLoginModal, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  const wishlistHostels = hostels.filter((hostel) => wishlist.includes(hostel.id));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1>My Dashboard</h1>
          <p className="text-gray-600">Manage your bookings and preferences</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="mb-4">No Bookings Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't made any bookings yet. Start exploring amazing hostels!
                </p>
                <Button onClick={() => navigate("/search")}>
                  Browse Hostels
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {bookings.map((booking) => {
                  const hostel = hostels.find((h) => h.id === booking.hostelId);
                  if (!hostel) return null;

                  return (
                    <Card key={booking.id}>
                      <div className="md:flex">
                        <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                          <ImageWithFallback
                            src={hostel.image}
                            alt={hostel.name}
                            className="w-full h-full object-cover rounded-l-lg"
                          />
                        </div>

                        <div className="flex-1">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{booking.hostelName}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                  <MapPin className="size-4" />
                                  {hostel.location}
                                </CardDescription>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                {booking.status}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Booking ID</p>
                                <p>{booking.id}</p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-600">Room Type</p>
                                <p>{booking.roomType}</p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-600">Check-in</p>
                                <p>{new Date(booking.checkIn).toLocaleDateString()}</p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-600">Check-out</p>
                                <p>{new Date(booking.checkOut).toLocaleDateString()}</p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-600">Guests</p>
                                <p>{booking.guests}</p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-xl">₹{booking.total}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => navigate(`/hostel/${booking.hostelId}`)}>
                                View Hostel
                              </Button>
                              <Button variant="outline">
                                Download Receipt
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            {wishlistHostels.length === 0 ? (
              <Card className="p-12 text-center">
                <Heart className="size-16 mx-auto mb-4 text-gray-300" />
                <h3 className="mb-4">Your Wishlist is Empty</h3>
                <p className="text-gray-600 mb-6">
                  Save your favorite hostels to easily find them later
                </p>
                <Button onClick={() => navigate("/search")}>
                  Explore Hostels
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistHostels.map((hostel) => (
                  <Card key={hostel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <ImageWithFallback
                        src={hostel.image}
                        alt={hostel.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute bottom-4 left-4">
                        {hostel.isAC ? "AC" : "Non-AC"}
                      </Badge>
                    </div>

                    <CardHeader>
                      <CardTitle>{hostel.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {hostel.location}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <p>
                          <span className="text-2xl">₹{hostel.price}</span>
                          <span className="text-gray-600">/night</span>
                        </p>
                        {hostel.availableRooms > 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Sold Out
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => navigate(`/hostel/${hostel.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full p-4">
                    <User className="size-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg">{user?.name || "Guest User"}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Mail className="size-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg">{user?.email || "guest@staynest.com"}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Calendar className="size-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg">February 2026</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
