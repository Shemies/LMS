import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { useProgress } from "./progressContext";
import { getDatabase, ref, onValue } from "firebase/database";


const Chapters = () => {
  const { progress, setProgress } = useProgress();
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const chaptersRef = ref(db, "chapters");

    // Fetch chapters from Firebase
    onValue(chaptersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const chaptersArray = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name,
          completed: data[key].done, 
        }));
        setChapters(chaptersArray);
      }
    });
  }, []);

  // Update progress dynamically
  useEffect(() => {
    if (chapters.length > 0) {
      const completedChapters = chapters.filter((ch) => ch.completed).length;
      const totalChapters = chapters.length;
      const newProgress = Math.round((completedChapters / totalChapters) * 100);
      setProgress(newProgress);
    }
  }, [chapters, setProgress]);

  return (
    <Layout >
      <h1 className="text-3xl font-bold text-white mb-6">Chapters</h1>

      {/* Progress Bar */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Syllabus Progress</h3>
        <div className="w-full bg-gray-300 rounded-full h-6 relative">
          <div
            className="h-6 bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
          <span className="absolute inset-0 flex items-center justify-center font-semibold text-white">
            {progress}%
          </span>
        </div>
      </div>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Chapter List</h3>
        <ul className="space-y-3">
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
            >
              <span className="font-semibold text-[#1E293B]">{chapter.name}</span>
              <span
                className={`px-3 py-1 rounded-full text-black text-sm ${
                  chapter.completed ? "bg-green-200" : "bg-gray-100"
                }`}
              >
                {chapter.completed ? "Completed" : "Not Yet"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Chapters;
