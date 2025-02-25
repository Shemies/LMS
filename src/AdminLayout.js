import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

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
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button
            className="sm:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <ul className="space-y-3">
          {[
            { name: "Dashboard", path: "/admin/dashboard" },
            { name: "Users", path: "/admin/users" },
            { name: "Chapters", path: "/admin/chapters" },
            { name: "Videos", path: "/admin/videos" },
            { name: "Mark Schemes", path: "/admin/markschemes" },
            { name: "Homeworks", path: "/admin/homeworks" },
            { name: "Exams", path: "/admin/exams" },
            { name: "Past Papers", path: "/admin/pastpapers" },
          ].map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="block w-full p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200"
                onClick={() => setSidebarOpen(false)}
              >
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
