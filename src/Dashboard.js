import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import { useProgress } from "./progressContext";
import { db, ref, onValue } from "./firebase";

const Dashboard = () => {
  const [username, setUsername] = useState("Loading...");
  const { progress, setProgress } = useProgress();

  // State for dynamic data
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch chapters progress from Firebase
    const chaptersRef = ref(db, "chapters");
    const unsubscribeChapters = onValue(chaptersRef, (snapshot) => {
      if (snapshot.exists()) {
        const chaptersData = snapshot.val();
        const completedChapters = Object.values(chaptersData).filter(ch => ch.done).length;
        const totalChapters = Object.keys(chaptersData).length;
        const calculatedProgress = Math.round((completedChapters / totalChapters) * 100);
        setProgress(calculatedProgress);
      }
    });

    // Fetch assignments from Firebase
    const assignmentsRef = ref(db, "homeworks");
    const unsubscribeAssignments = onValue(assignmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const assignmentsData = Object.values(snapshot.val());
        setAssignments(assignmentsData);
      }
    });

    // Fetch exams from Firebase
    const examsRef = ref(db, "exams");
    const unsubscribeExams = onValue(examsRef, (snapshot) => {
      if (snapshot.exists()) {
        const examsData = Object.values(snapshot.val());
        setExams(examsData);
      }
    });

    // Fetch recent activity from Firebase
    const activityRef = ref(db, "recentActivity");
    const unsubscribeActivity = onValue(activityRef, (snapshot) => {
      if (snapshot.exists()) {
        const activityData = Object.values(snapshot.val());
        setRecentActivity(activityData);
      }
    });

    return () => {
      unsubscribeChapters();
      unsubscribeAssignments();
      unsubscribeExams();
      unsubscribeActivity();
    };
  }, [setProgress]);

  const safeProgress = progress || 0;

  const data = [
    { name: "Completed", value: safeProgress },
    { name: "Remaining", value: 100 - safeProgress },
  ];
  const COLORS = ["#3B82F6", "#E5E7EB"];

  // Responsive Pie Chart size
  const [chartSize, setChartSize] = useState(220);
  useEffect(() => {
    const handleResize = () => setChartSize(window.innerWidth < 640 ? 150 : 220);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout username={username}>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Syllabus Completion */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center min-w-0">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Syllabus Completion</h3>
          <div className="w-full flex justify-center max-w-[300px]">
            <ResponsiveContainer width="100%" height={chartSize}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius="60%"
                  outerRadius="90%"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-lg font-bold mt-3 text-black">{safeProgress}% Completed</p>
        </div>

        {/* Due Assignments */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Due Assignments</h3>
          <ul className="space-y-2">
            {assignments.length > 0 ? (
              assignments.map((assignment, index) => (
                <li key={index} className="p-3 bg-gray-100 rounded-lg">
                  <span className="font-semibold text-[#1E293B]">{assignment.title}</span> - <span className="text-gray-600">{assignment.due}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No assignments due.</p>
            )}
          </ul>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Upcoming Exams</h3>
          <ul className="space-y-2">
            {exams.length > 0 ? (
              exams.map((exam, index) => (
                <li key={index} className="p-3 bg-gray-100 rounded-lg">
                  <span className="font-semibold text-[#1E293B]">{exam.subject}</span> - <span className="text-gray-600">{exam.date}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No upcoming exams.</p>
            )}
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Recent Activity</h3>
          <ul className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <li key={index} className="p-3 bg-gray-100 rounded-lg text-black">{activity}</li>
              ))
            ) : (
              <p className="text-gray-500">No recent activity.</p>
            )}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/videos" className="p-4 text-black bg-gray-200 text-center rounded-lg hover:bg-gray-300 transition">Videos</Link>
            <Link to="/markschemes" className="p-4 text-black bg-gray-200 text-center rounded-lg hover:bg-gray-300 transition">Mark Schemes</Link>
            <Link to="/homeworks" className="p-4 text-black bg-gray-200 text-center rounded-lg hover:bg-gray-300 transition">Homeworks</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
