import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  coordinates: [number, number]; // [latitude, longitude]
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
  hostels: Hostel[];
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
  user: { name: string; email: string; id: string } | null;
  setUser: (user: { name: string; email: string; id: string } | null) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  addHostel: (hostelData: Omit<Hostel, "id" | "reviews">) => Promise<boolean>;
  deleteHostel: (id: string) => Promise<boolean>;
  fetchHostels: () => Promise<void>;
  syncFromGoogle: (city: string) => Promise<{ success: boolean; message: string; count?: number }>;
  showLoginModal: boolean;
  setShowLoginModal: (value: boolean) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  const [compareList, setCompareList] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; id: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchHostels();
    setupAuthListener();
  }, []);

  // Fetch bookings when user logs in
  useEffect(() => {
    if (user?.id) {
      fetchBookings(user.id);
    } else {
      setBookings([]);
    }
  }, [user]);

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/hostels`);
      const data = response.data;

      const formattedData: Hostel[] = data.map((item: any) => ({
        id: item._id, // MongoDB uses _id
        name: item.name,
        location: item.location,
        price: item.price,
        isAC: item.isAC,
        image: item.image,
        rating: item.rating,
        availableRooms: item.availableRooms,
        amenities: item.amenities || [],
        roomTypes: item.roomTypes || [],
        distanceFromCenter: item.distanceFromCenter,
        cancellationPolicy: item.cancellationPolicy,
        coordinates: item.coordinates || [0, 0],
        description: item.description,
        images: item.images || [],
        reviews: []
      }));
      setHostels(formattedData);
    } catch (e) {
      console.error("Error fetching hostels:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const setupAuthListener = () => {
    // Basic local auth for now, as we're migrating
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  };

  const fetchBookings = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${userId}`);
      const data = response.data;

      const mappedBookings: Booking[] = data.map((b: any) => ({
        id: b._id,
        hostelId: b.hostelId?._id || b.hostelId,
        hostelName: b.hostelName,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guests: b.guests,
        roomType: b.roomType,
        total: b.total,
        status: b.status,
        bookingDate: b.bookingDate
      }));
      setBookings(mappedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

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

  const addBooking = async (booking: Booking) => {
    if (!user) return;

    try {
      const response = await axios.post(`${API_URL}/bookings`, {
        userId: user.id,
        hostelId: booking.hostelId,
        hostelName: booking.hostelName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        roomType: booking.roomType,
        total: booking.total,
        status: booking.status
      });

      setBookings([...bookings, { ...booking, id: response.data._id }]);
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  const addHostel = async (hostelData: Omit<Hostel, "id" | "reviews">) => {
    try {
      await axios.post(`${API_URL}/hostels`, hostelData);
      // Refresh context data
      fetchHostels();
      return true;
    } catch (error) {
      console.error("Add hostel error", error);
      return false;
    }
  };

  const deleteHostel = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/hostels/${id}`);
      fetchHostels();
      return true;
    } catch (error) {
      console.error("Delete hostel error", error);
      return false;
    }
  };

  const syncFromGoogle = async (city: string) => {
    try {
      const response = await axios.post(`${API_URL}/sync/google`, { city });
      fetchHostels(); // Refresh the list
      return response.data;
    } catch (error: any) {
      console.error("Sync error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to sync from OpenStreetMap"
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        hostels,
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
        addHostel,
        deleteHostel,
        fetchHostels,
        syncFromGoogle,
        showLoginModal,
        setShowLoginModal,
        isLoading
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
