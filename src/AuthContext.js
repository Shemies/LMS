import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "./firebase";

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [courseData, setCourseData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Fetch all users from the database
        const usersRef = ref(db, "users");
        try {
          const snapshot = await get(usersRef);
          if (snapshot.exists()) {
            const usersData = snapshot.val();

            // Find the user by email
            const foundUser = Object.values(usersData).find(
              (u) => u.email === user.email
            );

            if (foundUser) {
              setRole(foundUser.role); // Set the role
              setEnrolledCourse(foundUser.enrolledCourse); // Set the enrolled course

              // Fetch course data based on enrolledCourse
              if (foundUser.enrolledCourse) {
                const courseRef = ref(db, `courses/${foundUser.enrolledCourse}`);
                const courseSnapshot = await get(courseRef);
                if (courseSnapshot.exists()) {
                  setCourseData(courseSnapshot.val()); // Set the course data
                }
              }
            } else {
              setRole("student"); // Default role if user not found
              setEnrolledCourse(null); // Default no enrolled course
              setCourseData({}); // Default empty course data
            }
          } else {
            setRole("student"); // Default role if no users exist
            setEnrolledCourse(null); // Default no enrolled course
            setCourseData({}); // Default empty course data
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setRole("student"); // Fallback role in case of error
          setEnrolledCourse(null); // Fallback no enrolled course
          setCourseData({}); // Fallback empty course data
        }
      } else {
        setUser(null);
        setRole(null);
        setEnrolledCourse(null);
        setCourseData({});
      }
      setLoading(false); // Set loading to false after fetching data
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        enrolledCourse,
        courseData,
        loading,
        setRole,
        setEnrolledCourse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};