import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ref, get } from "firebase/database";
import { useAuth } from "./AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setRole, setEnrolledCourse } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        console.log("Login successful");

        const usersRef = ref(db, "users");
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const foundUser = Object.values(usersData).find(
            (u) => u.email === user.email
          );

          if (foundUser) {
            setRole(foundUser.role);
            setEnrolledCourse(foundUser.enrolledCourse);

            console.log("User Role:", foundUser.role);
            console.log("Enrolled Course:", foundUser.enrolledCourse);

            if (foundUser.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/dashboard");
            }
          } else {
            setError("User data not found. Please contact support.");
          }
        } else {
          setError("No users found in the database. Please contact support.");
        }
      } else {
        setError("Please verify your email before logging in.");
      }
    } catch (err) {
      console.error("Firebase Error:", err); // Log the full error object
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/user-disabled":
          setError("Your account has been disabled. Please contact support.");
          break;
        case "auth/user-not-found":
          setError("No user found with this email address.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        default:
          setError("An error occurred. Please try again later.");
          break;
      }
    } finally {
      setLoading(false);
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
              required
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
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center">
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