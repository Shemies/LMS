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
  const [activeChapter, setActiveChapter] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is authenticated:", user.email);

        const usersRef = ref(db, "users");
        const unsubscribeUsers = onValue(
          usersRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const usersData = snapshot.val();
              const authenticatedUser = Object.values(usersData).find(
                (u) => u.email === user.email
              );

              if (authenticatedUser) {
                console.log("Authenticated user data:", authenticatedUser);
                if (authenticatedUser.enrolledCourse) {
                  setEnrolledCourse(authenticatedUser.enrolledCourse);
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

        return () => unsubscribeUsers();
      } else {
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!enrolledCourse) return;

    const markSchemesRef = ref(db, `courses/${enrolledCourse}/markschemes`);
    const unsubscribeMarkSchemes = onValue(
      markSchemesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const markSchemesData = snapshot.val();
          const filteredMarkSchemes = {};
          
          Object.entries(markSchemesData).forEach(([chapter, pdfs]) => {
            // Convert pdfs to array and filter published items
            const pdfArray = Object.values(pdfs).filter(
              pdf => pdf.published !== false
            );
            
            if (pdfArray.length > 0) {
              filteredMarkSchemes[chapter] = pdfArray; // Store as array
            }
          });

          console.log("Filtered mark schemes:", filteredMarkSchemes);
          setMarkSchemes(filteredMarkSchemes);
        } else {
          console.log("No mark schemes found for the enrolled course.");
          setMarkSchemes({});
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

    return () => unsubscribeMarkSchemes();
  }, [enrolledCourse]);

  const toggleChapter = (chapter) => {
    if (activeChapter === chapter) {
      setActiveChapter(null);
    } else {
      setActiveChapter(chapter);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-black mb-6">Mark Schemes</h1>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[80%] mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Chapters</h3>

        {Object.keys(markSchemes).length > 0 ? (
          Object.entries(markSchemes).map(([chapter, pdfs]) => (
            <div key={chapter} className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleChapter(chapter)}
              >
                <h4 className="text-md font-bold text-[#1E293B]">{chapter}</h4>
                <span className="text-gray-600">
                  {activeChapter === chapter ? "▲" : "▼"}
                </span>
              </div>

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