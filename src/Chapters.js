import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { useProgress } from "./progressContext";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const Chapters = () => {
  const { progress, setProgress } = useProgress();
  const [chapters, setChapters] = useState([]);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const db = getDatabase();

    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is authenticated:", user.uid); // Debugging

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

    const db = getDatabase();
    const chaptersRef = ref(db, `courses/${enrolledCourse}/chapters`);

    // Fetch chapters for the enrolled course
    const unsubscribeChapters = onValue(
      chaptersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const chaptersArray = Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name,
            completed: data[key].done,
          }));
          setChapters(chaptersArray);
        } else {
          setError("No chapters found for the enrolled course.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching chapters:", error);
        setError("Failed to fetch chapters. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribeChapters(); // Cleanup chapters listener
  }, [enrolledCourse]); // Re-fetch when enrolledCourse changes

  // Update progress dynamically
  useEffect(() => {
    if (chapters.length > 0) {
      const completedChapters = chapters.filter((ch) => ch.completed).length;
      const totalChapters = chapters.length;
      const newProgress = Math.round((completedChapters / totalChapters) * 100);
      setProgress(newProgress);
    }
  }, [chapters, setProgress]);

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
      <h1 className="text-3xl font-bold text-black mb-6">Chapters</h1>

      {/* Progress Bar */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-2">Syllabus Progress</h3>
        <div className="w-full bg-gray-300 rounded-full h-6 relative">
          <div
            className="h-6 bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
          <span className="absolute inset-0 flex items-center justify-center font-semibold text-white">
            {progress}%
          </span>
        </div>
      </div>

      {/* Chapter List */}
      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Chapter List</h3>
        <ul className="space-y-3">
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              className="flex justify-between items-center p-3 bg-gray-200 rounded-lg"
            >
              <span className="font-semibold text-[#1E293B]">{chapter.name}</span>
              <span
                className={`px-3 py-1 rounded-full text-black text-sm ${
                  chapter.completed ? "bg-green-200" : "bg-gray-100"
                }`}
              >
                {chapter.completed ? "Completed" : "Not Yet"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Chapters;