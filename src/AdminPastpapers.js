import React, { useState, useEffect } from "react";
import { db, ref, push, onValue, remove } from "./firebase";

const AdminPastPapers = () => {
  const [courses, setCourses] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [year, setYear] = useState("");
  const [session, setSession] = useState("Jan");
  const [folder, setFolder] = useState("QP");
  const [paperName, setPaperName] = useState("");
  const [paperUrl, setPaperUrl] = useState("");

  // Fetch all courses and their past papers
  useEffect(() => {
    const coursesRef = ref(db, "courses");
    onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        setCourses(snapshot.val());
      } else {
        setCourses({});
      }
    });
  }, []);

  // Add a new past paper
  const handleAddPaper = () => {
    if (selectedCourse && year && session && folder && paperName && paperUrl) {
      const paperRef = ref(db, `courses/${selectedCourse}/pastpapers/${year}/${session}/${folder}`);
      push(paperRef, { name: paperName, file: paperUrl });
      setPaperName("");
      setPaperUrl("");
    }
  };

  // Delete a past paper
  const handleDeletePaper = (course, year, session, folder, paperKey) => {
    const paperRef = ref(db, `courses/${course}/pastpapers/${year}/${session}/${folder}/${paperKey}`);
    remove(paperRef);
  };

  // Toggle year visibility
  const handleYearToggle = (year) => {
    setSelectedYear((prev) => (prev === year ? null : year));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Past Papers</h1>

      {/* Add New Past Paper Form */}
      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[90%] sm:w-[80%] mx-auto mb-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Add New Past Paper</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border p-2 rounded-lg text-black"
          >
            <option value="">Select Course</option>
            {Object.keys(courses).map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Year (e.g. 2024)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 rounded-lg text-black"
          />
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="border p-2 rounded-lg text-black"
          >
            <option value="Jan">January</option>
            <option value="March">March</option>
            <option value="June">June</option>
            <option value="Nov">November</option>
          </select>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="border p-2 rounded-lg text-black"
          >
            <option value="QP">Question Papers</option>
            <option value="MS">Mark Schemes</option>
          </select>
          <input
            type="text"
            placeholder="Paper Name"
            value={paperName}
            onChange={(e) => setPaperName(e.target.value)}
            className="border p-2 rounded-lg text-black"
          />
          <input
            type="text"
            placeholder="Paper URL"
            value={paperUrl}
            onChange={(e) => setPaperUrl(e.target.value)}
            className="border p-2 rounded-lg text-black"
          />
        </div>
        <button
          onClick={handleAddPaper}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Past Paper
        </button>
      </div>

      {/* Course Tabs */}
      <div className="flex gap-2 overflow-auto mb-4">
        {Object.keys(courses).map((course) => (
          <button
            key={course}
            onClick={() => {
              setSelectedCourse(course);
              setSelectedYear(null); // Reset selected year when switching courses
            }}
            className={`p-2 rounded-lg ${
              selectedCourse === course ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            {course}
          </button>
        ))}
      </div>

      {/* Past Papers List */}
      {selectedCourse && (
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[90%] sm:w-[80%] mx-auto">
          {Object.keys(courses[selectedCourse].pastpapers || {})
            .sort((a, b) => b - a) // Sort years in descending order
            .map((year) => (
              <div key={year} className="mb-4">
                <button
                  onClick={() => handleYearToggle(year)}
                  className="w-full text-left text-lg font-bold text-[#1E293B] p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex justify-between items-center"
                >
                  {year}
                  <span className="text-gray-600">{selectedYear === year ? "▲" : "▼"}</span>
                </button>

                {selectedYear === year && (
                  <div className="mt-2 pl-4 border-l-4 border-blue-500">
                    {Object.keys(courses[selectedCourse].pastpapers[year]).map((session) => (
                      <div key={session} className="mb-4">
                        <h5 className="text-md font-semibold text-blue-600 mb-2">{session} Session</h5>
                        {Object.keys(courses[selectedCourse].pastpapers[year][session]).map((folder) => (
                          <div key={folder} className="ml-4 mb-4">
                            <h6 className="text-sm font-medium text-gray-700 mb-2">
                              {folder === "QP" ? "Question Papers" : "Mark Schemes"}
                            </h6>
                            <ul className="space-y-2">
                              {Object.entries(courses[selectedCourse].pastpapers[year][session][folder]).map(
                                ([paperKey, paper]) => (
                                  <li key={paperKey} className="p-3 bg-gray-100 rounded-lg flex justify-between">
                                    <a
                                      href={paper.file}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {paper.name}
                                    </a>
                                    <button
                                      onClick={() =>
                                        handleDeletePaper(selectedCourse, year, session, folder, paperKey)
                                      }
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      ✖
                                    </button>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminPastPapers;