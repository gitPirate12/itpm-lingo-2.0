"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { MdLogout, MdTranslate, MdForum, MdChat } from "react-icons/md";

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log("Session Status:", status);
    console.log("Full Session Data:", session);

    if (session?.user) {
      console.log("User Details:", {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || "No image found",
      });

      if (session.user.image) {
        console.log("Testing image URL:", session.user.image);
        const img = new Image();
        img.src = session.user.image;
        img.onload = () => console.log("Image loaded successfully:", session.user.image);
        img.onerror = () => console.error("Failed to load image:", session.user.image);
      }
    } else {
      console.log("No user data in session");
    }
  }, [status, session]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      router.push("/sign-in");
      setMobileMenuOpen(false);
    } catch (error) {
      toast.error("Logout failed", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <FaTimes className="h-5 w-5" />
                ) : (
                  <FaBars className="h-5 w-5" />
                )}
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 ml-2 md:ml-0">
                <span className="text-xl font-bold text-gray-900">ITPM-LINGO</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/chatbot"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/chatbot") ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <MdChat className="h-5 w-5" />
                <span>Ask AI</span>
              </Link>
              <Link
                href="/visual-text-analyzer"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/visual-text-analyzer") ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <MdTranslate className="h-5 w-5" />
                <span>Visual to Text</span>
              </Link>
              <Link
                href="/forum"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/forum") ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <MdForum className="h-5 w-5" />
                <span>Forum</span>
              </Link>
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                <div className="h-9 w-9 animate-pulse bg-gray-200 rounded-full" />
              ) : session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0 hover:bg-gray-100"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={session.user.name || "User"}
                          onLoadingStatusChange={(status) =>
                            console.log("AvatarImage loading status:", status)
                          }
                          onError={() =>
                            console.error("AvatarImage failed to load:", session.user.image)
                          }
                        />
                        <AvatarFallback>
                          {session.user.name?.charAt(0)?.toUpperCase() || (
                            <FaUserCircle className="h-6 w-6 text-gray-500" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer flex items-center space-x-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                      disabled={isLoading}
                    >
                      <MdLogout className="h-4 w-4" />
                      <span>{isLoading ? "Signing out..." : "Sign out"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/sign-in")}
                    className="hidden sm:inline-flex"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push("/sign-up")}
                    className="bg-blue-600 hover:bg-blue-700 text-white hidden sm:inline-flex"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/chatbot"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/chatbot")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <MdChat className="h-5 w-5" />
                <span>Ask AI</span>
              </Link>
              <Link
                href="/visual-text-analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/visual-text-analyzer")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <MdTranslate className="h-5 w-5" />
                <span>Visual to Text</span>
              </Link>
              <Link
                href="/forum"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/forum")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <MdForum className="h-5 w-5" />
                <span>Forum</span>
              </Link>

              {!session?.user && (
                <div className="pt-4 pb-2 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={() => {
                      router.push("/sign-in");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      router.push("/sign-up");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {session?.user && (
                <div className="pt-4 pb-2 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <MdLogout className="h-5 w-5" />
                    <span>{isLoading ? "Signing out..." : "Sign out"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Add padding to the top of the page content to account for the fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;