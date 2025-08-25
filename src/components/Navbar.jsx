import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Moon, Sun } from "lucide-react";
import EnableNotifications from "./EnableNotifications";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigate to home page after successful logout
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-secondary-800 shadow-medium border-b border-secondary-100 dark:border-secondary-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-2 text-2xl text-black font-extrabold"
              onClick={closeMobileMenu}
            >
              Drivi
              <span className="font-display  text-gradient">
                go
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 dark:text-white ">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`nav-link ${
                isActive("/about") ? "nav-link-active" : ""
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`nav-link ${
                isActive("/contact") ? "nav-link-active" : ""
              }`}
            >
              Contact
            </Link>
            <EnableNotifications />
            {/* Conditional Links */}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${
                    isActive("/dashboard") ? "nav-link-active" : ""
                  }`}
                >
                  Dashboard
                </Link>
                {/* Show user's role if available */}
                {user.user_metadata?.role && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100">
                    {user.user_metadata.role}
                  </span>
                )}
                <Link
                  to="/profile"
                  className="ml-2 p- rounded-full border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-600 transition-colors"
                  aria-label="Profile"
                  title="My Profile"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </Link>
                <button onClick={handleLogout} className="btn-danger text-sm">
                  Logout <LogOut className="ml-2" size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn-secondary text-sm">
                  Sign Up
                </Link>
                <Link to="/signin" className="btn-primary text-sm">
                  Sign In
                </Link>
              </>
            )}
            
            {/* Profile Icon Button */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-secondary-700 hover:text-primary-600 p-2 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-secondary-100">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive("/")
                    ? "text-primary-600 bg-primary-50"
                    : "text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive("/about")
                    ? "text-primary-600 bg-primary-50"
                    : "text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive("/contact")
                    ? "text-primary-600 bg-primary-50"
                    : "text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              <EnableNotifications />
              {/* Conditional Mobile Links */}
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive("/dashboard")
                        ? "text-primary-600 bg-primary-50"
                        : "text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  
                  {/* Show user info in mobile menu */}
                  <div className="px-3 py-2 flex items-center space-x-2">
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-800">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-secondary-900">
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </span>
                      {user.user_metadata?.role && (
                        <span className="text-xs text-primary-600">
                          {user.user_metadata.role}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive("/profile")
                        ? "text-primary-600 bg-primary-50"
                        : "text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Logout <LogOut className="ml-2" size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                </>
              )}
              {/* Theme Toggle Button for mobile */}
              <button
                onClick={toggleTheme}
                className="hidden w-full mt-2 p-2 rounded-full border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-600 transition-colors"
                aria-label="Toggle dark mode"
                title={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <svg
                    className="w-5 h-5 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                    />
                  </svg>
                )}
                <span className="ml-2 align-middle">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Theme Toggle Button */}
      <button
              onClick={toggleTheme}
              className="hidden fixed right-10 bottom-10 p-2 rounded-full border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-600 transition-colors"
              aria-label="Toggle dark mode"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun size={30} />
              ) : (
                <Moon size={30} />
              )}
            </button>
    </nav>
  );
};

export default Navbar;
