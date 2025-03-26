import { SessionProvider } from "next-auth/react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        {/* Navbar with fixed positioning */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        
        {/* Main content with padding to account for navbar */}
        <main className="flex-1 pt-16 pb-20"> {/* pt-16 for navbar, pb-20 for footer */}
          {children}
        </main>
        
        {/* Footer at bottom */}
        <div className="relative w-full">
          <Footer />
        </div>
      </div>
    </SessionProvider>
  );
}