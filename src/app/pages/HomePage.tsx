import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Calendar, MapPin, Users, Search, Shield, BadgeCheck, HeadphonesIcon, Wallet, Star, Heart, ArrowRight, Sparkles, TrendingUp, Globe, Home } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function HomePage() {
  const navigate = useNavigate();
  const { hostels, setSearchParams, wishlist, addToWishlist, removeFromWishlist } = useApp();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ location, checkIn, checkOut, guests });
    navigate("/search");
  };

  const featuredHostels = hostels.slice(0, 3);

  const toggleWishlist = (hostelId: string) => {
    if (wishlist.includes(hostelId)) {
      removeFromWishlist(hostelId);
    } else {
      addToWishlist(hostelId);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1764923514116-732cc3287621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3N0ZWwlMjBpbnRlcmlvciUyMGxvdW5nZXxlbnwxfHx8fDE3NzE4MjE4MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')"
          }}
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-slate-900/60 to-violet-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-violet-900/30" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8">
            <Sparkles className="size-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">Trusted by 50,000+ travelers across India</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
              Hostel Stay
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white/80 leading-relaxed">
            Discover affordable, comfortable, and verified hostels across India.
            Book with confidence, travel with joy.
          </p>

          {/* Search Form - Glassmorphism */}
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 max-w-5xl mx-auto shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 size-5 group-focus-within:text-indigo-300 transition-colors" />
                <Input
                  type="text"
                  placeholder="Where to?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 h-14 bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:bg-white/15 focus:border-indigo-400/50 transition-all"
                />
              </div>

              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 size-5 group-focus-within:text-indigo-300 transition-colors" />
                <Input
                  type="date"
                  placeholder="Check-in"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-12 h-14 bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:bg-white/15 focus:border-indigo-400/50 transition-all [color-scheme:dark]"
                />
              </div>

              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 size-5 group-focus-within:text-indigo-300 transition-colors" />
                <Input
                  type="date"
                  placeholder="Check-out"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-12 h-14 bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:bg-white/15 focus:border-indigo-400/50 transition-all [color-scheme:dark]"
                />
              </div>

              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 size-5 group-focus-within:text-indigo-300 transition-colors" />
                <Input
                  type="number"
                  placeholder="Guests"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  min="1"
                  className="pl-12 h-14 bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:bg-white/15 focus:border-indigo-400/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-5 h-14 text-lg rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] font-semibold"
            >
              <Search className="mr-2 size-5" />
              Search Hostels
            </Button>
          </form>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Globe className="size-5 text-indigo-300" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-white">100+</p>
                <p className="text-xs text-white/60">Cities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Home className="size-5 text-indigo-300" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-white">2,500+</p>
                <p className="text-xs text-white/60">Hostels</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <TrendingUp className="size-5 text-emerald-300" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-white">4.8★</p>
                <p className="text-xs text-white/60">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hostels */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Star className="size-4" />
              Handpicked for you
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)' }}>Featured Hostels</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              Our most popular and highest-rated stays, curated for an unforgettable experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredHostels.map((hostel) => (
              <Card
                key={hostel.id}
                className="overflow-hidden group border-0 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 hover:-translate-y-2 rounded-2xl bg-white flex flex-col"
              >
                {/* Image — only wishlist button overlays */}
                <div className="relative h-52 overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={hostel.image}
                    alt={hostel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  <button
                    onClick={() => toggleWishlist(hostel.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                  >
                    <Heart
                      className={`size-5 ${wishlist.includes(hostel.id) ? "fill-rose-500 text-rose-500" : "text-slate-500"
                        }`}
                    />
                  </button>
                </div>

                {/* All details below the image */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg truncate" style={{ fontFamily: 'var(--font-heading)' }}>{hostel.name}</CardTitle>
                    <Badge className="flex-shrink-0 bg-indigo-50 text-indigo-700 border-0 font-semibold text-xs">
                      {hostel.isAC ? "❄️ AC" : "🌿 Non-AC"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="size-3.5 flex-shrink-0" />
                    {hostel.location}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3 flex-1">
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>₹{hostel.price}</span>
                    <span className="text-sm text-slate-400">/night</span>
                  </div>

                  {/* Rating + Availability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-amber-50 rounded-full px-3 py-1">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-amber-700 text-sm">{hostel.rating}</span>
                    </div>

                    <div>
                      {hostel.availableRooms > 0 ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-xs">
                          {hostel.availableRooms} rooms available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium text-xs">
                          Sold Out
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 group/btn"
                    onClick={() => navigate(`/hostel/${hostel.id}`)}
                  >
                    View Details
                    <ArrowRight className="size-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              onClick={() => navigate("/search")}
              className="rounded-full px-8 py-6 text-base border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 group"
            >
              Explore All Hostels
              <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Shield className="size-4" />
              Why travelers trust us
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)' }}>Why Choose {import.meta.env.VITE_APP_NAME || "StayNest"}?</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              We make hostel booking seamless and trustworthy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Wallet,
                title: "Affordable Prices",
                description: "Best rates guaranteed. Compare and save on your stay.",
                gradient: "from-emerald-500 to-teal-500",
                bgLight: "bg-emerald-50",
                shadowColor: "shadow-emerald-100"
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Safe and secure payment options for your peace of mind.",
                gradient: "from-blue-500 to-indigo-500",
                bgLight: "bg-blue-50",
                shadowColor: "shadow-blue-100"
              },
              {
                icon: BadgeCheck,
                title: "Verified Hostels",
                description: "All hostels are verified for quality and safety standards.",
                gradient: "from-violet-500 to-purple-500",
                bgLight: "bg-violet-50",
                shadowColor: "shadow-violet-100"
              },
              {
                icon: HeadphonesIcon,
                title: "24/7 Support",
                description: "Round-the-clock customer support for any assistance.",
                gradient: "from-amber-500 to-orange-500",
                bgLight: "bg-amber-50",
                shadowColor: "shadow-amber-100"
              }
            ].map((benefit, _index) => (
              <div
                key={benefit.title}
                className={`text-center p-8 rounded-2xl ${benefit.bgLight} hover:shadow-xl ${benefit.shadowColor} transition-all duration-500 hover:-translate-y-1 group`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} text-white mb-5 shadow-lg ${benefit.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="size-7" />
                </div>
                <h3 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
