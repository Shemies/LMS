import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { auth, db, ref, query, orderByChild, equalTo, onValue } from "./firebase";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    studentId: "",
    level: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = () => {
      const currentUser = auth.currentUser; // Get logged-in user

      if (currentUser) {
        const email = currentUser.email; // Extract email
        const usersRef = ref(db, "users"); // Reference to users collection

        // Query to find user by email
        const userQuery = query(usersRef, orderByChild("email"), equalTo(email));

        onValue(
          userQuery,
          (snapshot) => {
            if (snapshot.exists()) {
              const userData = Object.values(snapshot.val())[0]; // Get first matched user
              setUser({
                name: userData.name || "N/A",
                email: userData.email || "N/A",
                studentId: userData.studentId || "N/A",
                level: userData.enrolledCourse || "N/A",
              });
            } else {
              setError("User data not found.");
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching user data:", error);
            setError("Failed to fetch user data. Please try again later.");
            setLoading(false);
          }
        );
      } else {
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    ); // Show loading spinner
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </Layout>
    ); // Show error message
  }

  return (
    <Layout username={user.name}>
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-xl rounded-lg border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Profile</h1>

        {/* Profile Picture Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-24 capitalize h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
            {user.name.charAt(0)}
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Name:</label>
            <p className="text-gray-900 text-lg">{user.name}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email:</label>
            <p className="text-gray-900 text-lg">{user.email}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Student ID:</label>
            <p className="text-gray-900 text-lg">{user.studentId}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Level:</label>
            <p className="text-gray-900 text-lg">{user.level}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;