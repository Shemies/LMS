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
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Image Section - Hidden on mobile, shows on lg screens */}
          <div className="hidden lg:block lg:w-1/2 flex justify-center">
            <img
              src={teamImage}
              alt="Team collaborating"
              className="w-full max-w-lg h-auto object-cover "
            />
          </div>

          {/* Form Section */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome Back</h2>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 flex justify-center items-center"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? "Processing..." : "Login"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <Link 
                  to="/forgot-password" 
                  className="text-blue-600 hover:text-blue-800 hover:underline transition"
                >
                  Forgot password?
                </Link>
                <p className="mt-4 text-gray-600">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;