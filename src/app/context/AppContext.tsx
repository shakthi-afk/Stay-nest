import React, { createContext, useContext, useState, ReactNode } from "react";

interface Hostel {
  id: string;
  name: string;
  location: string;
  price: number;
  isAC: boolean;
  image: string;
  rating: number;
  availableRooms: number;
  amenities: string[];
  roomTypes: string[];
  distanceFromCenter: string;
  cancellationPolicy: string;
  description: string;
  images: string[];
  reviews: Review[];
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface Booking {
  id: string;
  hostelId: string;
  hostelName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  total: number;
  status: string;
  bookingDate: string;
}

interface AppContextType {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  compareList: string[];
  addToCompare: (hostelId: string) => void;
  removeFromCompare: (hostelId: string) => void;
  wishlist: string[];
  addToWishlist: (hostelId: string) => void;
  removeFromWishlist: (hostelId: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: { name: string; email: string } | null;
  setUser: (user: { name: string; email: string } | null) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  showLoginModal: boolean;
  setShowLoginModal: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  const [compareList, setCompareList] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const addToCompare = (hostelId: string) => {
    if (compareList.length < 4 && !compareList.includes(hostelId)) {
      setCompareList([...compareList, hostelId]);
    }
  };

  const removeFromCompare = (hostelId: string) => {
    setCompareList(compareList.filter((id) => id !== hostelId));
  };

  const addToWishlist = (hostelId: string) => {
    if (!wishlist.includes(hostelId)) {
      setWishlist([...wishlist, hostelId]);
    }
  };

  const removeFromWishlist = (hostelId: string) => {
    setWishlist(wishlist.filter((id) => id !== hostelId));
  };

  const addBooking = (booking: Booking) => {
    setBookings([...bookings, booking]);
  };

  return (
    <AppContext.Provider
      value={{
        searchParams,
        setSearchParams,
        compareList,
        addToCompare,
        removeFromCompare,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        bookings,
        addBooking,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export type { Hostel, Review, SearchParams, Booking };
