import React from "react";
import { FaInstagram } from "react-icons/fa"; // Import Instagram icon from react-icons

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-300">Phone: +20 100 4672283</p>
            <p className="text-gray-300">Email: info@teamabbassi.com</p>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.open("https://www.instagram.com/team.abbassi/", "_blank")}
                className="flex items-center space-x-2 hover:text-blue-300 transition duration-300"
              >
                <FaInstagram className="w-6 h-6" />
                <span>Instagram</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-blue-300 transition duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-300 hover:text-blue-300 transition duration-300">
                  Register
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-300 hover:text-blue-300 transition duration-300">
                  Login
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-6">
          <p className="text-gray-300">
            &copy; 2025 Team Abbassi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;