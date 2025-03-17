import React, { useEffect, useState } from "react";
import { db, ref, onValue } from "./firebase";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "./Layout";

const Homeworks = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is authenticated:", user.email); // Debugging

        // Fetch all users to find the one matching the authenticated user
        const usersRef = ref(db, "users");
        const unsubscribeUsers = onValue(
          usersRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const usersData = snapshot.val();

              // Find the user with the matching email (or other unique identifier)
              const authenticatedUser = Object.values(usersData).find(
                (u) => u.email === user.email
              );

              if (authenticatedUser) {
                console.log("Authenticated user data:", authenticatedUser); // Debugging
                if (authenticatedUser.enrolledCourse) {
                  setEnrolledCourse(authenticatedUser.enrolledCourse); // Set enrolled course
                } else {
                  setError("No enrolled course found. Please enroll in a course.");
                }
              } else {
                setError("User data not found. Please complete your profile.");
              }
            } else {
              setError("No users found in the database.");
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching users:", error);
            setError("Failed to fetch user data. Please try again later.");
            setLoading(false);
          }
        );

        return () => unsubscribeUsers(); // Cleanup users listener
      } else {
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  useEffect(() => {
    if (!enrolledCourse) return; // Exit if no enrolled course

    // Fetch homeworks for the enrolled course
    const homeworksRef = ref(db, `courses/${enrolledCourse}/homeworks`);
    const unsubscribeHomeworks = onValue(
      homeworksRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedHomeworks = Object.entries(data).map(([id, hw]) => ({
            id,
            ...hw,
          }));

          // Debugging: Log unsorted homeworks
          console.log("Unsorted homeworks:", formattedHomeworks);

          // Sort homeworks by due date (oldest last)
          const sortedHomeworks = formattedHomeworks.sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateB - dateA; // Sort in ascending order (oldest first)
          });

          // Debugging: Log sorted homeworks
          console.log("Sorted homeworks:", sortedHomeworks);

          setHomeworks(sortedHomeworks);
        } else {
          setHomeworks([]);
          setError("No homeworks found for the enrolled course.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching homeworks:", error);
        setError("Failed to fetch homeworks. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribeHomeworks(); // Cleanup homeworks listener
  }, [enrolledCourse]); // Re-fetch when enrolledCourse changes

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
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-black">Homeworks</h1>

      <div className="space-y-4">
        {homeworks.length > 0 ? (
          homeworks.map((hw) => (
            <div
              key={hw.id}
              className={`p-5 rounded-lg border ${
                hw.dueDate < today ? "bg-red-900 text-white" : "bg-gray-400 text-black"
              }`}
            >
              <h2 className="text-xl font-semibold">{hw.title}</h2>
              <p className="text-white">{hw.description}</p>
              <p className="mt-2 font-medium">
                Due Date: <span className="text-yellow-400">{hw.dueDate}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No homeworks available.</p>
        )}
      </div>
    </Layout>
  );
};

export default Homeworks;