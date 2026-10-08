import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { ComparePage } from "./pages/ComparePage";
import { HostelDetailPage } from "./pages/HostelDetailPage";
import { BookingPage } from "./pages/BookingPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { NotFound } from "./pages/NotFound";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "search", Component: SearchPage },
      { path: "compare", Component: ComparePage },
      { path: "hostel/:id", Component: HostelDetailPage },
      { path: "booking/:id", Component: BookingPage },
      { path: "confirmation", Component: ConfirmationPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "admin",
    children: [
      { index: true, Component: AdminPage },
      { path: "login", Component: AdminLoginPage },
    ],
  },
]);
