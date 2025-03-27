import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { auth, db, ref, query, orderByChild, equalTo, onValue } from "./firebase";
import { FiUser, FiMail, FiCreditCard, FiBook, FiEdit } from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    studentId: "",
    level: "",
  });
  const [initials, setInitials] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const email = currentUser.email;
        const usersRef = ref(db, "users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(email));

        onValue(
          userQuery,
          (snapshot) => {
            if (snapshot.exists()) {
              const userData = Object.values(snapshot.val())[0];
              const fullName = userData.name;
              const nameParts = fullName.split(" ");
              const firstName = nameParts[0];
              const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
              setUser({
                name: userData.name || "N/A",
                email: userData.email || "N/A",
                studentId: userData.studentId || "N/A",
                level: userData.enrolledCourse || "N/A",
              });

              const initials = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`;
              setInitials(initials.toUpperCase());
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-red-50 p-6 rounded-lg w-full max-w-md text-center">
            <div className="text-red-600 font-medium text-lg mb-2">Error</div>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout username={user.name}>
      <div className="mx-auto px-4 py-6 w-full">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Profile Header - Mobile Optimized */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6 text-white">
            <div className="flex flex-col items-center text-center sm:text-left sm:flex-row">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl sm:text-4xl font-bold mb-3 sm:mb-0 sm:mr-6">
                {initials}
              </div>
              <div className="mt-3 sm:mt-0">
                <h1 className="text-xl sm:text-2xl font-bold break-words">{user.name}</h1>
                <p className="text-indigo-100 text-sm sm:text-base mt-1">{user.level}</p>
              </div>
            </div>
          </div>

          {/* Profile Details - Stacked on Mobile */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <FiUser className="text-indigo-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Full Name</h3>
                  <p className="text-base font-medium text-gray-900 break-words">{user.name}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <FiMail className="text-indigo-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Email Address</h3>
                  <p className="text-base font-medium text-gray-900 break-all">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <FiCreditCard className="text-indigo-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Student ID</h3>
                  <p className="text-base font-medium text-gray-900">{user.studentId}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <FiBook className="text-indigo-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Current Level</h3>
                  <p className="text-base font-medium text-gray-900">{user.level}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;