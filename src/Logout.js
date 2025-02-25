import React, { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom"; // For navigation

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await signOut(auth); // Sign out from Firebase
        navigate("/"); // Redirect to login page after successful logout
      } catch (err) {
        console.error("Logout error: ", err.message);
      }
    };

    logoutUser(); // Trigger the logout
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Logging out...
        </h2>
      </div>
    </div>
  );
};

export default Logout;
