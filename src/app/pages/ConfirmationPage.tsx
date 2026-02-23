import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { CheckCircle, Download, Home, Calendar, Users, MapPin } from "lucide-react";

export function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  useEffect(() => {
    if (!booking) {
      navigate("/");
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert("Receipt download would start here");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="size-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">Booking Confirmed!</CardTitle>
            <p className="text-gray-600">
              Your reservation has been successfully confirmed
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Booking ID</span>
                <Badge className="text-lg px-4 py-1">{booking.id}</Badge>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-left mb-4">{booking.hostelName}</h3>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Check-in to Check-out</p>
                      <p>
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Guests</p>
                      <p>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Room Type</p>
                      <p>{booking.roomType}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg">
                <span>Total Paid</span>
                <span>₹{booking.total}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full h-12" onClick={handleDownloadReceipt}>
                <Download className="size-5 mr-2" />
                Download Receipt
              </Button>
              
              <Button variant="outline" className="w-full h-12" onClick={() => navigate("/dashboard")}>
                View My Bookings
              </Button>
              
              <Button variant="ghost" className="w-full h-12" onClick={() => navigate("/")}>
                <Home className="size-5 mr-2" />
                Back to Home
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-left">
              <p className="mb-2">
                <strong>What's Next?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>A confirmation email has been sent to your email address</li>
                <li>You can view and manage your booking in the Dashboard</li>
                <li>Please carry a valid ID proof during check-in</li>
                <li>Contact the hostel for any special requests</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
