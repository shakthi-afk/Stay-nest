import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Home, Search } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-9xl mb-4 text-blue-600">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/")} size="lg">
            <Home className="mr-2 size-5" />
            Go Home
          </Button>
          <Button variant="outline" onClick={() => navigate("/search")} size="lg">
            <Search className="mr-2 size-5" />
            Search Hostels
          </Button>
        </div>
      </div>
    </div>
  );
}
