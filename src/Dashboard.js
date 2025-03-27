import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import { useProgress } from "./progressContext";
import { db, ref, onValue } from "./firebase";
import { useAuth } from "./AuthContext";
import { FaWhatsapp, FaPhone } from "react-icons/fa";

// Date formatting helper
const formatDate = (date, options = {}) => {
  if (!date) return '';
  const defaultOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('en-US', {...defaultOptions, ...options});
};

const Dashboard = () => {
  const [username, setUsername] = useState("Loading...");
  const { progress, setProgress } = useProgress();
  const { enrolledCourse } = useAuth();

  // State for dynamic data
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [latestChapterDone, setLatestChapterDone] = useState(null);
  const [loading, setLoading] = useState(true);

  const contactNumber = "+201004672283"; // WhatsApp contact number

  useEffect(() => {
    if (!enrolledCourse) return;

    setLoading(true);
    const today = new Date();

    // Fetch chapters progress from Firebase
    const chaptersRef = ref(db, `courses/${enrolledCourse}/chapters`);
    const unsubscribeChapters = onValue(chaptersRef, (snapshot) => {
      if (snapshot.exists()) {
        const chaptersData = snapshot.val();
        const completedChapters = Object.values(chaptersData).filter((ch) => ch.done).length;
        const totalChapters = Object.keys(chaptersData).length;
        const calculatedProgress = Math.round((completedChapters / totalChapters) * 100);
        setProgress(calculatedProgress);

        // Find the latest completed chapter by completion date
        const completedChaptersList = Object.values(chaptersData)
          .filter((ch) => ch.done)
          .map(ch => ({
            ...ch,
            completedAt: ch.completedAt ? new Date(ch.completedAt) : new Date(0)
          }))
          .sort((a, b) => b.completedAt - a.completedAt);

        setLatestChapterDone(completedChaptersList[0] || null);
      }
    });

    // Fetch assignments from Firebase
    const assignmentsRef = ref(db, `courses/${enrolledCourse}/homeworks`);
    const unsubscribeAssignments = onValue(assignmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const assignmentsData = Object.entries(snapshot.val()).map(([id, hw]) => ({
          id,
          ...hw,
          dueDateObj: new Date(hw.dueDate)
        }));

        // Filter upcoming assignments (due date in future)
        const upcoming = assignmentsData
          .filter(assignment => assignment.dueDateObj > today)
          .sort((a, b) => a.dueDateObj - b.dueDateObj) // Sort by due date (closest first)
          .slice(0, 3); // Show only 3 upcoming assignments

        setUpcomingAssignments(upcoming);
      }
    });

    setLoading(false);
    return () => {
      unsubscribeChapters();
      unsubscribeAssignments();
    };
  }, [enrolledCourse, setProgress]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  // Define chart data and colors
  const safeProgress = progress || 0;
  const progressData = [
    { name: "Completed", value: safeProgress },
    { name: "Remaining", value: 100 - safeProgress },
  ];
  const COLORS = ["#4F46E5", "#E5E7EB"];

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Progress Card */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Course Progress</h3>
              <span className="text-xs md:text-sm font-medium px-2 md:px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                {safeProgress}%
              </span>
            </div>
            <div className="h-40 md:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius="70%"
                    outerRadius="90%"
                    dataKey="value"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, value === safeProgress ? 'Completed' : 'Remaining']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
              <Link 
                to="/chapters" 
                className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium hover:underline"
              >
                View all chapters
              </Link>
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
              <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                {upcomingAssignments.length} upcoming
              </span>
            </div>
            <div className="space-y-2 md:space-y-3">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment) => (
                  <Link 
                    key={assignment.id} 
                    to="/homeworks"
                    className="block p-2 md:p-3 bg-gray-50 rounded-md md:rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 text-sm md:text-base truncate">
                        {assignment.title}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                        Due {formatDate(assignment.dueDateObj, {year: undefined})}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                      {assignment.description}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="p-3 md:p-4 text-center">
                  <p className="text-gray-500 text-sm md:text-base">No upcoming assignments</p>
                  <Link 
                    to="/homeworks" 
                    className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium hover:underline mt-1 md:mt-2 inline-block"
                  >
                    View all assignments
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Latest Chapter Done */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Last Completed</h3>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                Recent
              </span>
            </div>
            {latestChapterDone ? (
              <div className="space-y-3 md:space-y-4">
                <div className="p-3 md:p-4 bg-purple-50 rounded-md md:rounded-lg">
                  <h4 className="font-bold text-purple-900 text-sm md:text-base">
                    {latestChapterDone.name}
                  </h4>
                  <p className="text-xs md:text-sm text-purple-700 mt-1">
                    Completed on {formatDate(latestChapterDone.completedAt)}
                  </p>
                </div>
                <Link 
                  to="/chapters" 
                  className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium hover:underline inline-block"
                >
                  Continue learning
                </Link>
              </div>
            ) : (
              <div className="p-3 md:p-4 text-center">
                <p className="text-gray-500 text-sm md:text-base">No chapters completed yet</p>
                <Link 
                  to="/chapters" 
                  className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium hover:underline mt-1 md:mt-2 inline-block"
                >
                  Start learning
                </Link>
              </div>
            )}
          </div>

          {/* Contact Support Team */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Contact Support Team</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Online
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                <FaWhatsapp className="text-green-500 text-4xl mb-3" />
                <p className="text-sm md:text-base text-gray-700 text-center mb-4">
                  Need help? Chat with our team on WhatsApp
                </p>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 w-full justify-center">
                  <a
                    href={`https://wa.me/${contactNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                  >
                    <FaWhatsapp className="mr-2" />
                    WhatsApp Chat
                  </a>
                  <a
                    href={`tel:${contactNumber}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                  >
                    <FaPhone className="mr-2" />
                    Call Us
                  </a>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Available 24/7
                </p>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;