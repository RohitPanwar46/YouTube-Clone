"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/userContext";
import { useState, useEffect, useRef } from "react";
import { apiRequest, API_ENDPOINTS } from "../app/lib/api";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const {
    user,
    isLoggedin,
    setIsloggedin,
    setUser,
    showHamburger,
    setShowHamburger,
  } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when mobile search is shown
  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  function handleSubmit(event) {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?title=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  }

  function handleChange(event) {
    setSearchQuery(event.target.value);
  }

  async function handleLogout() {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, {
        method: "POST",
        credentials: "include",
      });
      setIsloggedin(false);
      setUser(null);
      setIsDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  return (
    <header className="fixed w-full top-0 left-0 right-0 h-12 md:h-16 bg-[#0f0f0f] shadow-lg z-30 flex items-center justify-between px-4">
      {/* Mobile Search Bar (Visible only when active on mobile) */}
      {showMobileSearch ? (
        <div className="flex items-center w-full">
          <button
            onClick={() => setShowMobileSearch(false)}
            className="p-2 mr-2 rounded-full hover:bg-[#303030]"
            aria-label="Close search"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512">
              <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
            </svg>
          </button>
          <form onSubmit={handleSubmit} className="relative flex flex-1 pt-1.5">
            <input
              ref={searchInputRef}
              onChange={handleChange}
              value={searchQuery}
              type="text"
              placeholder="Search..."
              className="w-full bg-[#181818] text-white py-2 px-4 rounded-full border border-[#303030] focus:border-red-500 focus:outline-none"
              aria-label="Search"
            />
            <button type="submit" className="absolute right-2 top-1 h-full px-4 bg-[#202020] rounded-r-full hover:bg-[#303030] transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <svg
              className="md:hidden pt-1 w-8 h-8 text-slate-100 mr-2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              onClick={() => setShowHamburger(!showHamburger)}
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <Link
              href={"/"}
              className="flex items-center text-xl md:text-2xl font-bold flex-shrink-0"
            >
              <svg
                className="w-8 h-8 text-red-600 mr-2"
                fill="currentColor"
                viewBox="0 0 576 512"
                aria-label="YouTube"
              >
                <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
              </svg>
              <span className="">YouTube</span>
            </Link>
          </div>

          {/* Center - Search Bar (Desktop) */}
          <div className="flex-1 max-w-xl mx-4 hidden md:flex justify-center">
            <form onSubmit={handleSubmit} className="flex w-full max-w-xl">
              <input
                onChange={handleChange}
                value={searchQuery}
                type="text"
                placeholder="Search videos, channels, and more"
                className="w-full bg-[#181818] text-white py-2 px-4 rounded-l-full border border-[#303030] focus:border-red-500 focus:outline-none transition-all duration-300"
                aria-label="Search"
              />
              <button
                type="submit"
                className="bg-[#202020] px-6 rounded-r-full hover:bg-[#303030] transition-all duration-300"
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 512 512"
                >
                  <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right Side - Action Icons and Avatar Dropdown */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden p-2 rounded-full hover:bg-[#303030]"
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 512 512"
              >
                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
              </svg>
            </button>

            {/* Action Buttons - Hidden on mobile when search is active */}
            <div className="hidden sm:flex items-center gap-2 md:gap-4">
              <button
                className="p-2 rounded-full hover:bg-[#303030] transition-all duration-300"
                aria-label="Live"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 576 512"
                >
                  <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" />
                </svg>
              </button>
              <button
                className="p-2 rounded-full hover:bg-[#303030] relative transition-all duration-300"
                aria-label="Notifications"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 448 512"
                >
                  <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3S207 512 224 512s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z" />
                </svg>
                <span className="absolute top-0 right-0 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  9+
                </span>
              </button>
            </div>

            {/* Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none"
                aria-label="User menu"
              >
                <Image
                  src={isLoggedin ? user?.avatar : "/default-avatar.png"}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full"
                  alt="User Avatar"
                  width={32}
                  height={32}
                  priority
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-[#181818] rounded-lg shadow-lg z-50 border border-[#303030]">
                  <div className="py-2">
                    {isLoggedin ? (
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#303030] transition-colors duration-200"
                      >
                        Logout
                      </button>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#303030] transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#303030] transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
