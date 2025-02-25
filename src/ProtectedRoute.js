import React from "react";
import { Navigate } from "react-router-dom"; // Import Navigate for redirecting
import { auth } from "./firebase"; // Import Firebase auth

const ProtectedRoute = ({ children }) => {
  // Check if the user is authenticated
  const user = auth.currentUser;

  if (!user) {
    // If the user is not logged in, redirect to the login page
    return <Navigate to="/" replace />;
  }


  return children; // If the user is authenticated, render the protected content
};

export default ProtectedRoute;
