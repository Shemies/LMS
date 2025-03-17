import React, { useState, useEffect } from "react";
import { db, ref, onValue, query, orderByChild, equalTo } from "./firebase";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "./Layout";

const PastPapers = () => {
  const [pastPapers, setPastPapers] = useState({});
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolledCourse, setEnrolledCourse] = useState(null);

  // Fetch user data and enrolled course
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const usersRef = ref(db, "users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(user.email));

        const unsubscribeUser = onValue(userQuery, (snapshot) => {
          if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0];
            if (userData.enrolledCourse) {
              setEnrolledCourse(userData.enrolledCourse); // Set enrolled course
            } else {
              setError("No enrolled course found. Please enroll in a course.");
            }
          } else {
            setError("User data not found. Please complete your profile.");
          }
          setLoading(false);
        });

        return () => unsubscribeUser(); // Cleanup user listener
      } else {
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  // Fetch past papers for the enrolled course
  useEffect(() => {
    if (!enrolledCourse) return; // Exit if no enrolled course

    const papersRef = ref(db, `courses/${enrolledCourse}/pastpapers`);
    const unsubscribePapers = onValue(
      papersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPastPapers(snapshot.val());
        } else {
          setPastPapers({});
          setError("No past papers found for the enrolled course.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching past papers:", error);
        setError("Failed to fetch past papers. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribePapers(); // Cleanup papers listener
  }, [enrolledCourse]);

  // Toggle Year View
  const handleYearToggle = (year) => {
    setSelectedYear((prev) => (prev === year ? null : year));
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
      <h1 className="text-3xl font-bold text-black mb-6">Past Papers</h1>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[90%] sm:w-[80%] mx-auto">
        {Object.keys(pastPapers)
          .sort((a, b) => b - a) // Show newest year first
          .map((year) => (
            <div key={year} className="mb-4">
              <button
                onClick={() => handleYearToggle(year)}
                className="w-full text-left text-lg font-bold text-[#1E293B] p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex justify-between items-center"
              >
                {year}
                <span className="text-gray-600">{selectedYear === year ? "▲" : "▼"}</span>
              </button>

              {selectedYear === year && (
                <div className="mt-2 pl-4 border-l-4 border-blue-500">
                  {Object.keys(pastPapers[year]).map((session) => (
                    <div key={session} className="mb-4">
                      <h5 className="text-md font-semibold text-blue-600 mb-2">{session} Session</h5>
                      {Object.keys(pastPapers[year][session]).map((folder) => (
                        <div key={folder} className="mb-2">
                          <h6 className="text-sm font-medium text-gray-700">{folder}</h6>
                          <ul className="space-y-2">
                            {Object.entries(pastPapers[year][session][folder]).map(([key, paper]) => (
                              <li
                                key={key}
                                className="p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                              >
                                <a
                                  href={paper.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {paper.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default PastPapers;