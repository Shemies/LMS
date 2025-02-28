import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "./firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
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
              setRole(foundUser.role); // Set the role if found
            } else {
              setRole("student"); // Default role if user not found
            }
          } else {
            setRole("student"); // Default role if no users exist
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("student"); // Fallback role in case of error
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false); // Set loading to false after fetching user and role
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, setRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};