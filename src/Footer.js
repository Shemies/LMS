import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p>&copy; 2023 Math IGCSE Pro. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <button
            onClick={() => window.open("https://facebook.com", "_blank")}
            className="hover:text-blue-600"
          >
            Facebook
          </button>
          <button
            onClick={() => window.open("https://instagram.com", "_blank")}
            className="hover:text-blue-600"
          >
            Instagram
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;