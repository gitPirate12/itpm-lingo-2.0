"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (!session) {
      router.push("/sign-in");
    }
  }, [session, status, router]);

  // Show loading state while session is being checked
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Only render layout if authenticated
  if (!session) {
    return null; // Redirect will handle this
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="flex-1 pt-16 pb-20">{children}</main>

      <div className="relative w-full">
        <Footer />
      </div>
    </div>
  );
}
