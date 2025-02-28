import React, { useState, useContext } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ref, get } from "firebase/database";
import { AuthContext } from "./AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setRole } = useContext(AuthContext); // Get setRole from context

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        console.log("Login successful");

        // Fetch all users from the database
        const usersRef = ref(db, "users");
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const usersData = snapshot.val();

          // Find the user by email
          const foundUser = Object.values(usersData).find(
            (u) => u.email === user.email
          );

          if (foundUser) {
            setRole(foundUser.role); // Set role in context
            console.log("User Role:", foundUser.role);

            // Navigate based on role
            if (foundUser.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/dashboard");
            }
          } else {
            setError("User role not found.");
          }
        } else {
          setError("User not found in database.");
        }
      } else {
        setError("Please verify your email before logging in.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Login</h2>

        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="mt-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            Login
          </button>
        </form>
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;