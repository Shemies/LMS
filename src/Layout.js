import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Check,
  Video,
  FileText,
  ClipboardList,
  BookOpen,
  File,
} from "lucide-react"; // Icons for menu and profile
import logo from "./assets/lms-logo.png"; // Ensure the logo is in src/assets/
import { auth, db, ref, onValue, query, orderByChild, equalTo } from "./firebase"; // Import Firebase Auth
import { onAuthStateChanged } from "firebase/auth"; // Import auth state listener

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("Loading...");
  const [studentId, setStudentId] = useState("Loading...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email;
        const usersRef = ref(db, "users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(email));

        onValue(userQuery, (snapshot) => {
          if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0]; // Get the first matching user
            setUsername(userData.name);
            setStudentId(userData.studentId || "Unknown ID"); // Ensure a fallback if studentId is missing
          } else {
            setUsername("Unknown User");
            setStudentId("Unknown ID");
          }
        });
      } else {
        setUsername("Not Logged In");
        setStudentId("No ID");
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div className="flex bg-gray-900 text-white min-h-screen">
      {/* Sidebar - Hidden on small screens */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 p-5 shadow-lg transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } sm:translate-x-0 sm:w-1/4`}
      >
        <div className="mb-6 flex justify-between items-center">
          <img src={logo} alt="LMS Logo" className="h-12" />
          {/* Close Button on Mobile */}
          <button
            className="sm:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <ul className="space-y-3">
          {[
            { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Chapters", path: "/chapters", icon: <Check size={20} /> },
            { name: "Videos", path: "/videos", icon: <Video size={20} /> },
            { name: "Mark Schemes", path: "/markschemes", icon: <FileText size={20} /> },
            { name: "Homeworks", path: "/homeworks", icon: <ClipboardList size={20} /> },
            { name: "Exams", path: "/exams", icon: <BookOpen size={20} /> },
            { name: "Past Papers", path: "/pastpapers", icon: <File size={20} /> },
          ].map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="flex items-center w-full p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200"
                onClick={() => setSidebarOpen(false)} // Close sidebar on mobile click
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex flex-col w-full sm:ml-[25%]">
        {/* Fixed Top Navbar */}
        <div className="fixed top-0 left-0 w-full bg-gray-800 p-4 shadow-md flex justify-between items-center z-40 sm:pl-[25%]">
          {/* Menu Button for Mobile */}
          <button
            className="sm:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <img src={logo} alt="LMS Logo" className="h-8 md:hidden lg:hidden" />
          {/* Profile Section - Aligned to the Right */}
          <div className="flex items-center space-x-3 ml-auto">
            <Link
              to="/profile"
              className="flex items-center space-x-3 cursor-pointer hover:underline"
            >
              {/* Profile Icon with Initial */}
              <div className="w-8 h-8 bg-gray-200 text-black capitalize rounded-full flex items-center justify-center text-sm font-bold">
                {username.charAt(0)}
              </div>
              <span className="text-lg capitalize font-semibold">
                {username} ({studentId})
              </span>
            </Link>
          </div>
        </div>

        {/* Page Content with Top Padding (to avoid overlapping) */}
        <div className="p-6 bg-gray-700 min-h-screen pt-16">{children}</div>
      </div>
    </div>
  );
};

export default Layout;