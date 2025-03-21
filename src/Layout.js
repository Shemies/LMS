import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  LogOut,
} from "lucide-react"; // Added LogOut icon
import logo from "./assets/lms-logo.png"; // Ensure the logo is in src/assets/
import { auth, db, ref, onValue, query, orderByChild, equalTo } from "./firebase"; // Import Firebase Auth
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import auth state listener and signOut

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("Loading...");
  const [studentId, setStudentId] = useState("Loading...");
  const [initials, setInitials] = useState("");
  const navigate = useNavigate(); // Use navigate for redirecting after logout

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email;
        const usersRef = ref(db, "users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(email));

        onValue(userQuery, (snapshot) => {
          if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0]; // Get the first matching user
            const fullName = userData.name;
            const nameParts = fullName.split(" ");
            const firstName = nameParts[0]; // Extract first name
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""; // Get last name if available

            setUsername(firstName);
            setStudentId(userData.studentId || "Unknown ID"); // Ensure a fallback if studentId is missing
            const initials = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`;
            setInitials(initials.toUpperCase()); // Ensure uppercase initials
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

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Error logging out: ", error);
      alert("Error logging out. Please try again.");
    }
  };

  return (
    <div className="flex bg-gray-300 text-white min-h-screen">
      {/* Sidebar - Hidden on small screens */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white p-5 transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } sm:translate-x-0 sm:w-1/4`}
      >
        <div className="mb-6 flex justify-between items-center">
          <img src={logo} alt="LMS Logo" className="h-20" href="/" />
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
            { name: "Exams Grades", path: "/exams", icon: <BookOpen size={20} /> },
            { name: "Past Papers", path: "/pastpapers", icon: <File size={20} /> },
          ].map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="flex items-center w-full p-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition duration-200"
                onClick={() => setSidebarOpen(false)} // Close sidebar on mobile click
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition duration-200"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex flex-col w-full sm:ml-[25%]">
        {/* Fixed Top Navbar */}
        <div className="fixed top-0 left-0 w-full bg-white p-4 shadow-md flex justify-between items-center z-40 sm:pl-[25%]">
          {/* Menu Button for Mobile */}
          <button
            className="sm:hidden text-black hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <img src={logo} alt="LMS Logo" className="h-12 md:hidden lg:hidden" />
          {/* Profile Section - Aligned to the Right */}
          <div className="flex items-center space-x-3 ml-auto">
            <Link
              to="/profile"
              className="flex items-center space-x-3 cursor-pointer"
            >
              {/* Profile Icon with Initial */}
              <div className="w-8 h-8 bg-blue-700 text-white capitalize rounded-full flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <span className="text-lg capitalize text-black font-semibold">
                {username} ({studentId})
              </span>
            </Link>
          </div>
        </div>

        {/* Page Content with Top Padding (to avoid overlapping) */}
        <div className="p-6 mt-6 bg-gray-200 min-h-screen pt-16">{children}</div>
      </div>
    </div>
  );
};

export default Layout;