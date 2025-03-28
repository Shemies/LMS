import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { 
  Menu, 
  X,
  LayoutDashboard,
  ClipboardList,
  ClipboardCheck,
  Bookmark,
  LogOut
} from "lucide-react";
import logo from "./assets/lms-logo.png"; // Common logo path in React projects

const AssistantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const assistantRoutes = [
    { 
      name: "Dashboard", 
      path: "/assistant/dashboard", 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      name: "Homeworks", 
      path: "/assistant/homeworks", 
      icon: <ClipboardList size={18} /> 
    },
    { 
      name: "Homework Tracking", 
      path: "/assistant/hwtracking", 
      icon: <ClipboardCheck size={18} /> 
    },
    { 
      name: "Exams", 
      path: "/assistant/exams", 
      icon: <Bookmark size={18} /> 
    },
  ];

  return (
    <div className="flex bg-white text-black min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-white p-5 shadow-lg transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } sm:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-10 w-10 mr-3" 
            />
            <h2 className="text-xl text-black font-semibold">Assistant Panel</h2>
          </div>
          <button
            className="sm:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <ul className="space-y-3">
          {assistantRoutes.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="flex items-center gap-3 w-full p-2 px-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-gray-300">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full sm:ml-64">
        {/* Top Navbar */}
        <div className="fixed top-0 left-0 w-full bg-white p-4 shadow-md flex justify-between items-center z-40 sm:pl-64">
          <div className="flex items-center">
            <button
              className="sm:hidden text-gray-400 hover:text-white mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-8 w-8 mr-2 sm:hidden" 
            />
          </div>
          <Link 
            to="/logout" 
            className="flex items-center gap-2 p-2 px-3 bg-red-900 text-white rounded-lg hover:bg-red-600 transition duration-200"
          >
            <LogOut size={18} />
            Logout
          </Link>
        </div>

        {/* Page Content */}
        <div className="p-6 bg-gray-200 min-h-screen pt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AssistantLayout;