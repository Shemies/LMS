import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import { useProgress } from "./progressContext";
import { db, ref, onValue } from "./firebase";
import { useAuth } from "./AuthContext"; // Import useAuth

const Dashboard = () => {
  const [username, setUsername] = useState("Loading...");
  const { progress, setProgress } = useProgress();
  const { enrolledCourse } = useAuth(); // Use enrolledCourse from context

  // State for dynamic data
  const [assignments, setAssignments] = useState([]);
  const [latestVideo, setLatestVideo] = useState(null); // State for latest video
  const [latestChapterDone, setLatestChapterDone] = useState(null);

  useEffect(() => {
    if (!enrolledCourse) return; // Exit if no enrolled course

    // Fetch chapters progress from Firebase
    const chaptersRef = ref(db, `courses/${enrolledCourse}/chapters`);
    const unsubscribeChapters = onValue(chaptersRef, (snapshot) => {
      if (snapshot.exists()) {
        const chaptersData = snapshot.val();
        const completedChapters = Object.values(chaptersData).filter((ch) => ch.done).length;
        const totalChapters = Object.keys(chaptersData).length;
        const calculatedProgress = Math.round((completedChapters / totalChapters) * 100);
        setProgress(calculatedProgress);

        // Find the latest completed chapter
        const latestChapter = Object.values(chaptersData)
          .filter((ch) => ch.done)
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
        setLatestChapterDone(latestChapter);
      }
    });

    // Fetch assignments from Firebase
    const assignmentsRef = ref(db, `courses/${enrolledCourse}/homeworks`);
    const unsubscribeAssignments = onValue(assignmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const assignmentsData = Object.values(snapshot.val());
        setAssignments(assignmentsData);
      }
    });

    // Fetch latest video from Firebase
    const videosRef = ref(db, `courses/${enrolledCourse}/videos`);
    const unsubscribeVideos = onValue(videosRef, (snapshot) => {
      if (snapshot.exists()) {
        const videosData = snapshot.val();
        const latestVideo = Object.values(videosData).sort((a, b) => new Date(b.date) - new Date(a.date))[0]; // Sort by date if available
        setLatestVideo(latestVideo);
      }
    });

    return () => {
      unsubscribeChapters();
      unsubscribeAssignments();
      unsubscribeVideos();
    };
  }, [enrolledCourse, setProgress]);

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
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center min-w-0 h-full">
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
        <Link to="/homeworks" className="block">
          <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl h-full">
            <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Due Assignments</h3>
            <ul className="space-y-2">
              {assignments.length > 0 ? (
                assignments.map((assignment, index) => (
                  <li key={index} className="p-3 bg-gray-100 rounded-lg">
                    <span className="font-semibold text-[#1E293B]">{assignment.title}</span> - <span className="text-gray-600">{assignment.dueDate}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No assignments due.</p>
              )}
            </ul>
          </div>
        </Link>

        {/* Latest Video */}
        <Link to="/videos" className="block">
          <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl h-full">
            <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Latest Video</h3>
            {latestVideo ? (
              <div className="p-3 bg-gray-100 rounded-lg">
                <span className="font-semibold text-[#1E293B]">{latestVideo.title}</span> -{" "}
                <a href={latestVideo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Watch Video
                </a>
              </div>
            ) : (
              <p className="text-gray-500">No videos available.</p>
            )}
          </div>
        </Link>

        {/* Latest Chapter Done */}
        <Link to="/chapters" className="block">
          <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl h-full">
            <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Latest Chapter Done</h3>
            {latestChapterDone ? (
              <div className="p-3 bg-gray-100 rounded-lg">
                <span className="font-semibold text-[#1E293B]">{latestChapterDone.name}</span>
              </div>
            ) : (
              <p className="text-gray-500">No chapters completed yet.</p>
            )}
          </div>
        </Link>
      </div>
    </Layout>
  );
};

export default Dashboard;