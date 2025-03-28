import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "./firebase";

export const AuthContext = createContext();

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
        try {
          const usersRef = ref(db, "users");
          const snapshot = await get(usersRef);
          
          if (snapshot.exists()) {
            const usersData = snapshot.val();
            const foundUser = Object.values(usersData).find(
              (u) => u.email === user.email
            );

            if (foundUser) {
              setRole(foundUser.role);
              setEnrolledCourse(foundUser.enrolledCourse || null);

              if (foundUser.enrolledCourse) {
                const courseRef = ref(db, `courses/${foundUser.enrolledCourse}`);
                const courseSnapshot = await get(courseRef);
                if (courseSnapshot.exists()) {
                  setCourseData(courseSnapshot.val());
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setRole(null);
        setEnrolledCourse(null);
        setCourseData({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};