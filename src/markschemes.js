import React, { useEffect, useState } from "react";
import { db, ref, onValue } from "./firebase";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "./Layout";

const MarkSchemes = () => {
  const [markSchemes, setMarkSchemes] = useState([]);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChapter, setActiveChapter] = useState(null); // Track the currently active chapter

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

    // Fetch mark schemes for the enrolled course
    const markSchemesRef = ref(db, `courses/${enrolledCourse}/markschemes`);
    const unsubscribeMarkSchemes = onValue(
      markSchemesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          console.log("Mark schemes data:", snapshot.val()); // Debugging
          setMarkSchemes(snapshot.val());
        } else {
          console.log("No mark schemes found for the enrolled course."); // Debugging
          setMarkSchemes([]);
          setError("No mark schemes found for the enrolled course.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching mark schemes:", error);
        setError("Failed to fetch mark schemes. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribeMarkSchemes(); // Cleanup mark schemes listener
  }, [enrolledCourse]); // Re-fetch when enrolledCourse changes

  // Toggle chapter visibility
  const toggleChapter = (chapter) => {
    if (activeChapter === chapter) {
      setActiveChapter(null); // Close the chapter if it's already open
    } else {
      setActiveChapter(chapter); // Open the clicked chapter
    }
  };

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
      <h1 className="text-3xl font-bold text-black mb-6">Mark Schemes</h1>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[80%] mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Chapters</h3>

        {Object.keys(markSchemes).length > 0 ? (
          Object.entries(markSchemes).map(([chapter, pdfs]) => (
            <div key={chapter} className="mb-6">
              {/* Chapter Title (Clickable to toggle visibility) */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleChapter(chapter)}
              >
                <h4 className="text-md font-bold text-[#1E293B]">{chapter}</h4>
                <span className="text-gray-600">
                  {activeChapter === chapter ? "▲" : "▼"}
                </span>
              </div>

              {/* PDF List (Visible only if active) */}
              {activeChapter === chapter && (
                <ul className="space-y-2 mt-2">
                  {pdfs.map((pdf, index) => (
                    <li key={index} className="p-3 bg-gray-100 rounded-lg">
                      <a
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {pdf.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            No mark schemes available for the enrolled course. Please check back later.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default MarkSchemes;