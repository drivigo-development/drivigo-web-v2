import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch("https://drivigo-server-v2.vercel.app/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: name || undefined, // Only send name if it's provided
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
      setName("");
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to subscribe. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-secondary-900 text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2">
            <Link
              to="/"
              className="flex items-center space-x-2 text-2xl text-white font-extrabold"
            >
              Drivi
              <span className="font-display  text-gradient">go</span>
            </Link>
            <p className="text-secondary-300 mt-2 mb-4 max-w-md text-lg lg:text-lg">
              Drivigo se Seekho!
            </p>
            <div className="flex space-x-4 ">
              <a
                target="_blank"
                href="https://www.instagram.com/drivigo.in/"
                className="text-secondary-400 hover:text-white transition-colors"
              >
                <Instagram />
              </a>
              <a
                target="_blank"
                href="https://www.facebook.com/profile.php?id=61573829202315"
                className="text-secondary-400 hover:text-white transition-colors"
              >
                <Facebook />
              </a>
              <a target="_blank" href="https://www.youtube.com/@drivigo-in" className="text-secondary-400 hover:text-white transition-colors"><Youtube /></a>
            <a target="_blank" href="https://www.linkedin.com/company/drivigo-in" className="text-secondary-400 hover:text-white transition-colors"><Linkedin /></a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="col-span-1 grid grid-cols-2 sm:grid-cols-2 gap-8 sm:gap-6">
            {/* Quick Links */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-secondary-300 text-sm sm:text-base hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-secondary-300 text-sm sm:text-base hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-secondary-300 text-sm sm:text-base hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-secondary-300 text-sm sm:text-base hover:text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-secondary-300 text-sm sm:text-base hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-secondary-300 text-sm sm:text-base hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-and-conditions"
                    className="text-secondary-300 text-sm sm:text-base hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter subscription section */}
          <div className="col-span-1 hidden lg:block">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-secondary-300 text-sm mb-1">
              Subscribe to our newsletter for the latest updates and driving
              tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-1">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="bg-secondary-800 text-white px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 w-full mb-2"
                />
              </div>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="bg-secondary-800 text-white px-3 py-2 text-sm rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-3 py-2 text-sm rounded-r-md transition-colors flex items-center justify-center min-w-[90px]"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Subscribe"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-center items-center">
          <p className="text-secondary-400 text-xs sm:text-sm text-center sm:text-left">
            &copy; {currentYear} Drivigo. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
