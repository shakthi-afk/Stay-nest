import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Home, Search, Heart, User, LogOut, Menu, LayoutDashboard, Sparkles } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, user, setUser, setShowLoginModal, wishlist, compareList } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all duration-300 relative group"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Home className="size-4" />
        <span>Home</span>
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full rounded-full" />
      </Link>
      
      <Link
        to="/search"
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all duration-300 relative group"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Search className="size-4" />
        <span>Search</span>
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full rounded-full" />
      </Link>

      {compareList.length > 0 && (
        <Link
          to="/compare"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all duration-300 relative group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <LayoutDashboard className="size-4" />
          <span>Compare</span>
          <span className="absolute -top-2 -right-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg shadow-indigo-200">
            {compareList.length}
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full rounded-full" />
        </Link>
      )}

      {isLoggedIn && (
        <>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all duration-300 relative group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Heart className="size-4" />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg shadow-rose-200">
                {wishlist.length}
              </span>
            )}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full rounded-full" />
          </Link>
          
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all duration-300 relative group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="size-4" />
            <span>Dashboard</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full rounded-full" />
          </Link>
        </>
      )}
    </>
  );

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-100" 
          : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="size-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-heading)' }}>
                StayNest
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-widest uppercase -mt-0.5">Premium Hostels</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="rounded-full border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full px-6 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 hover:scale-105"
              >
                <User className="size-4 mr-2" />
                Login / Sign Up
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-left bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-5 mt-8">
                <NavLinks />
                
                <div className="pt-6 border-t border-slate-100">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user?.name}</p>
                          <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleLogout} className="w-full rounded-xl">
                        <LogOut className="size-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => {
                      setShowLoginModal(true);
                      setMobileMenuOpen(false);
                    }} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600">
                      <User className="size-4 mr-2" />
                      Login / Sign Up
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
