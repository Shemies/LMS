import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { auth, db, ref, query, orderByChild, equalTo, onValue } from "./firebase";

const Profile = () => {
  const [user, setUser] = useState({
    name: "Loading...",
    email: "Loading...",
    studentId: "Loading...",
    level: "Loading...",
  });

  useEffect(() => {
    const fetchUserData = () => {
      const currentUser = auth.currentUser; // Get logged-in user

      if (currentUser) {
        const email = currentUser.email; // Extract email
        const usersRef = ref(db, "users"); // Reference to users collection

        // Query to find user by email
        const userQuery = query(usersRef, orderByChild("email"), equalTo(email));

        onValue(userQuery, (snapshot) => {
          if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0]; // Get first matched user
            setUser({
              name: userData.name || "N/A",
              email: userData.email || "N/A",
              studentId: userData.studentId || "N/A",
              level: userData.level || "N/A",
            });
          } else {
            setUser({
              name: "Not Found",
              email: email,
              studentId: "N/A",
              level: "N/A",
            });
          }
        });
      }
    };

    fetchUserData();
  }, []);

  return (
    <Layout username={user.name}>
      <div className="max-w-xl mx-auto bg-white p-6 shadow-lg rounded-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* Profile Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Name:</label>
            <p className="text-gray-800">{user.name}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Email:</label>
            <p className="text-gray-800">{user.email}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Student ID:</label>
            <p className="text-gray-800">{user.studentId}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Level:</label>
            <p className="text-gray-800">{user.level}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
