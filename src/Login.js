import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ref, get } from "firebase/database";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import teamImage from "./20944201.jpg";

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

          // Redirect based on role
          switch(foundUser.role) {
            case "admin":
              navigate("/admin");
              break;
            case "assistant":
              navigate("/assistant");
              break;
            default:
              navigate("/dashboard");
          }
        } else {
          setError("User data not found. Please contact support.");
        }
      } else {
        setError("No users found in the database. Please contact support.");
      }
    } catch (err) {
      console.error("Login error:", err);
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
    <div className="font-sans bg-gray-50 text-gray-900 bg-white">
      <Navbar />
      
      <div className="flex items-center justify-center bg-white min-h-screen">
        <div className="hidden lg:block">
          <img
            src={teamImage}
            alt="Team Graphic"
            className="w-full max-w-md ml-9"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
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
              Not registered?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;