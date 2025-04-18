import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  BookMarked,
  PlaySquare,
  FileCheck,
  ClipboardCheck,
  BookOpenCheck,
  FileSearch,
  LogOut,
  Home,
  BookText,
  CalendarCheck,
  Video,
  FileText,
  FileArchive,
  Users,
  FileBox,
  GraduationCap,
  CalendarDays,
  MessageCircle
} from "lucide-react";
import logo from "./assets/lms-logo.png";
import { auth, db, ref, onValue, query, orderByChild, equalTo } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaWhatsapp } from "react-icons/fa";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("Loading...");
  const [studentId, setStudentId] = useState("Loading...");
  const [initials, setInitials] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email;
        const usersRef = ref(db, "users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(email));

        onValue(userQuery, (snapshot) => {
          if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0];
            const fullName = userData.name;
            const nameParts = fullName.split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

            setUsername(firstName);
            setStudentId(userData.studentId || "Unknown ID");
            setInitials(`${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase());
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

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out: ", error);
      alert("Error logging out. Please try again.");
    }
  };

  const openWhatsAppChat = () => {
    const phoneNumber = "201004672283";
    const message = "Hello, I have a question about the LMS system.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Updated navigation items with better matching icons
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Chapters", path: "/chapters", icon: <BookText size={20} /> }, // Changed to BookText for content chapters
    { name: "Videos", path: "/videos", icon: <Video size={20} /> }, // Changed to Video for better representation
    { name: "Mark Schemes", path: "/markschemes", icon: <FileCheck size={20} /> }, // Kept as it's appropriate
    { name: "Homework", path: "/homeworks", icon: <CalendarDays size={20} /> }, // Changed to CalendarDays for deadlines
    { name: "Exams Grades", path: "/exams", icon: <GraduationCap size={20} /> }, // Changed to GraduationCap for exams
    { name: "Past Papers", path: "/pastpapers", icon: <FileArchive size={20} /> }, // Changed to FileArchive for past papers
    { name: "Online Meetings", path: "/online-meetings", icon: <Users size={20} /> }, // Changed to Users for meetings
  ];

  return (
    <div className="flex bg-gray-300 text-white min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white p-5 transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } sm:translate-x-0 sm:w-1/4`}
      >
        <div className="mb-2 flex justify-between items-center">
          <button
            className="sm:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <ul className="space-y-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="flex items-center w-full p-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="mt-2">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition duration-200"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full sm:ml-[25%]">
        {/* Top Navbar */}
        <div className="fixed top-0 left-0 w-full bg-white p-4 shadow-md flex justify-between items-center z-40 sm:pl-[25%]">
          <button
            className="sm:hidden text-black hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <img src={logo} alt="LMS Logo" className="h-14" />
          <div className="flex items-center space-x-3 ml-auto">
            <Link
              to="/profile"
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-700 text-white capitalize rounded-full flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <span className="text-lg capitalize text-black font-semibold">
                {username} ({studentId})
              </span>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 mt-6 bg-gray-200 min-h-screen pt-16">{children}</div>
      </div>

      {/* Floating WhatsApp Button */}
      <div 
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-green-600 transition-colors duration-300 z-50"
        onClick={openWhatsAppChat}
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </div>
    </div>
  );
};

export default Layout;