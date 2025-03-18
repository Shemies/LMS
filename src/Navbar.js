import React from "react";
import { Link } from "react-router-dom";
import logo from "./assets/lms-logo.png"; // Ensure the logo is in src/assets/

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="LMS Logo" className="h-20" /> {/* Logo */}
            <div className="lg:text-3xl font-bold text-blue-950 hidden lg:block ">Team Abbassi</div> {/* Brand Name */}
          </Link>

          {/* Login and Register Buttons */}
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-transparent border border-blue-900 text-blue-900 px-4 py-2 rounded-md hover:bg-blue-900 hover:text-white transition duration-300"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;