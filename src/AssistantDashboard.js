import React from "react";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";

const AssistantDashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Manage Homeworks",
      description: "Create and assign homeworks to students",
      link: "/assistant/homeworks",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Exam Management",
      description: "View and manage student exams",
      link: "/assistant/exams",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: "Homework Tracking",
      description: "Track student homework submissions",
      link: "/assistant/hwtracking",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assistant Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`${action.bgColor} p-6 rounded-lg shadow-sm hover:shadow-md transition`}
          >
            <h3 className={`${action.textColor} font-semibold text-lg mb-2`}>{action.title}</h3>
            <p className="text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, Assistant</h2>
        <p className="text-gray-600">
          You are logged in as <span className="font-medium">{user?.email}</span>.
          As an assistant, you have access to homework and exam management features.
        </p>
      </div>
    </div>
  );
};

export default AssistantDashboard;