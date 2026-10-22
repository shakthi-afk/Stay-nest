import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoginModal } from "./LoginModal";
import AIChatAssistant from "./AIChatAssistant";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LoginModal />
      {/* AI Assistant — floats over all pages */}
      <AIChatAssistant />
    </div>
  );
}
