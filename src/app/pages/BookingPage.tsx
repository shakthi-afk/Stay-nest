import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useApp } from "../context/AppContext";
import { hostels } from "../data/hostels";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { CreditCard, Smartphone, Building2, Wallet as WalletIcon, Banknote, Shield, Check } from "lucide-react";

export function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addBooking, searchParams: search, isLoggedIn, user, setShowLoginModal } = useApp();
  
  const roomType = searchParams.get("roomType") || "ac";
  const hostel = hostels.find((h) => h.id === id);

  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState("");
  const [idProof, setIdProof] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

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

  if (!isLoggedIn) {
    setShowLoginModal(true);
    navigate(`/hostel/${id}`);
    return null;
  }

  const basePrice = roomType === "ac" ? hostel.price : Math.round(hostel.price * 0.7);
  const checkInDate = search.checkIn || new Date().toISOString().split('T')[0];
  const checkOutDate = search.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  // Calculate number of nights
  const nights = Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000));
  
  const subtotal = basePrice * nights;
  const taxes = Math.round(subtotal * 0.12); // 12% GST
  const total = subtotal + taxes - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Promo code applied! 10% discount");
    } else if (promoCode.toUpperCase() === "FIRST50") {
      setDiscount(50);
      toast.success("Promo code applied! ₹50 discount");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName || !guestEmail || !guestPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const booking = {
      id: `BK${Date.now()}`,
      hostelId: hostel.id,
      hostelName: hostel.name,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: search.guests || 1,
      roomType: roomType === "ac" ? "AC" : "Non-AC",
      total,
      status: "Confirmed",
      bookingDate: new Date().toISOString(),
    };

    addBooking(booking);
    toast.success("Booking confirmed!");
    navigate("/confirmation", { state: { booking } });
  };

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "upi", name: "UPI", icon: Smartphone },
    { id: "netbanking", name: "Net Banking", icon: Building2 },
    { id: "wallet", name: "Wallet", icon: WalletIcon },
    { id: "cash", name: "Cash on Arrival", icon: Banknote },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Details */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Details</CardTitle>
                <CardDescription>Enter your information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="idproof">ID Proof (Optional)</Label>
                      <Input
                        id="idproof"
                        type="file"
                        onChange={(e) => setIdProof(e.target.files?.[0] || null)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment option</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            paymentMethod === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                          onClick={() => setPaymentMethod(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Icon className="size-5 text-gray-600" />
                          <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                            {method.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {/* Payment Form Fields */}
                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" type="password" maxLength={3} />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="mt-6">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" placeholder="yourname@upi" />
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="mt-6">
                    <Label htmlFor="bank">Select Bank</Label>
                    <select
                      id="bank"
                      className="w-full h-10 px-3 border rounded-md"
                    >
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Other</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-5 text-green-600" />
                <span>100% Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-green-600" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3>{hostel.name}</h3>
                  <p className="text-sm text-gray-600">{hostel.location}</p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in</span>
                    <span>{new Date(checkInDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out</span>
                    <span>{new Date(checkOutDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights</span>
                    <span>{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span>{search.guests || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type</span>
                    <Badge>{roomType === "ac" ? "AC" : "Non-AC"}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">₹{basePrice} × {nights} nights</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees (12%)</span>
                    <span>₹{taxes}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <Separator />

                {/* Promo Code */}
                <div>
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                    />
                    <Button type="button" variant="outline" onClick={handleApplyPromo}>
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Try: SAVE10 or FIRST50
                  </p>
                </div>

                <Button className="w-full h-12 text-lg" onClick={handleBooking}>
                  Confirm Booking
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By confirming, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
