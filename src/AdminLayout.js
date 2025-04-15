import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { 
  Menu, 
  X,
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  ClipboardCheck,
  Bookmark,
  FileArchive,
  UserPlus,
  LogOut
} from "lucide-react";


const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-900 text-white min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 p-5 shadow-lg transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } sm:translate-x-0`}
      >
        <div className=" flex justify-between items-center">
          <button
            className="sm:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <ul className="space-y-3">
          {[
            { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
            { name: "Users", path: "/admin/users", icon: <Users size={18} /> },
            { name: "Chapters", path: "/admin/chapters", icon: <BookOpen size={18} /> },
            { name: "Videos", path: "/admin/videos", icon: <Video size={18} /> },
            { name: "Mark Schemes", path: "/admin/markschemes", icon: <FileText size={18} /> },
            { name: "Homework Ann.", path: "/admin/homeworks", icon: <ClipboardList size={18} /> },
            { name: "Homework Tracking", path: "/admin/hwtracking", icon: <ClipboardCheck size={18} /> },
            { name: "Exams", path: "/admin/exams", icon: <Bookmark size={18} /> },
            { name: "Past Papers", path: "/admin/pastpapers", icon: <FileArchive size={18} /> },
            { name: "Online Meetings", path: "/admin/online-meeting", icon: <UserPlus size={18} /> },
            { name: "Registration Requests", path: "/admin/registration-requests", icon: <UserPlus size={18} /> },

            
            // { name: "Student Report", path: "/admin/studentreport" },

          ].map((item) => (
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
        <div className="fixed top-0 left-0 w-full bg-gray-800 p-4 shadow-md flex justify-between items-center z-40 sm:pl-64">
          <button
            className="sm:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          
            <Link to="/logout" className="block w-20 text-center p-2 bg-red-900 rounded-lg hover:bg-red-600 transition duration-200" onClick={() => setSidebarOpen(false)}>
            Logout</Link>
          
        </div>

        {/* Page Content */}
        <div className="p-6 bg-gray-700 min-h-screen pt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
