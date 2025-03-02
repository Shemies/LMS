import React, { useState, useEffect } from "react";
import { db, ref, onValue } from "./firebase";

const AdminExamGrades = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState({}); // Grouped by course and exam
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchById, setSearchById] = useState(""); // New state for searching by student ID

  // Fetch all users and their exam grades
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const formattedUsers = Object.entries(usersData).map(([id, user]) => ({
          id,
          ...user,
        }));
        setUsers(formattedUsers);

        // Group exam grades by course and exam name
        const coursesData = {};
        formattedUsers.forEach((user) => {
          if (user.examGrades && user.enrolledCourse) {
            const course = user.enrolledCourse;
            if (!coursesData[course]) {
              coursesData[course] = {};
            }
            Object.entries(user.examGrades).forEach(([examName, exam]) => {
              if (!coursesData[course][examName]) {
                coursesData[course][examName] = [];
              }
              coursesData[course][examName].push({
                userId: user.id,
                studentId: user.studentId, // Add studentId to the exam data
                userName: user.name,
                school: user.school,
                ...exam,
              });
            });
          }
        });
        setCourses(coursesData);
      } else {
        setUsers([]);
        setCourses({});
      }
    });
  }, []);

  // Filter users based on school, search query, and student ID
  const filteredExams = selectedCourse && selectedExam
    ? courses[selectedCourse][selectedExam]?.filter((exam) => {
        const matchesSchool = !schoolFilter || exam.school === schoolFilter;
        const matchesSearch = !searchQuery || exam.userName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesId = !searchById || exam.studentId.toString().includes(searchById); // Filter by student ID
        return matchesSchool && matchesSearch && matchesId;
      })
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Exam Grades</h1>

      {/* Course Tabs */}
      <div className="flex gap-2 overflow-auto mb-4">
        {Object.keys(courses).map((course) => (
          <button
            key={course}
            onClick={() => {
              setSelectedCourse(course);
              setSelectedExam(null); // Reset selected exam when switching courses
            }}
            className={`p-2 rounded-lg ${
              selectedCourse === course ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {course}
          </button>
        ))}
      </div>

      {/* Exam Tabs (only shown if a course is selected) */}
      {selectedCourse && (
        <div className="flex gap-2 overflow-auto mb-4">
          {Object.keys(courses[selectedCourse]).map((examName) => (
            <button
              key={examName}
              onClick={() => setSelectedExam(examName)}
              className={`p-2 rounded-lg ${
                selectedExam === examName ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {examName}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4 text-black">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Search by Student ID"
            value={searchById}
            onChange={(e) => setSearchById(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">All Schools</option>
            {[...new Set(users.map((user) => user.school))].map((school) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam Grades Table (only shown if an exam is selected) */}
      {selectedExam && (
        <div className="bg-white p-4 rounded shadow text-black">
          <h2 className="text-xl font-semibold mb-2">Grades for {selectedExam} ({selectedCourse})</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Student ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">School</th>
                <th className="border p-2">Grade</th>
                <th className="border p-2">Mark</th>
                <th className="border p-2">Total Mark</th>
                <th className="border p-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam, index) => (
                <tr key={index}>
                  <td className="border p-2">{exam.studentId}</td>
                  <td className="border p-2">{exam.userName}</td>
                  <td className="border p-2">{exam.school}</td>
                  <td className="border p-2">{exam.grade}</td>
                  <td className="border p-2">{exam.mark}</td>
                  <td className="border p-2">{exam.totalMark}</td>
                  <td className="border p-2">{exam.comment || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminExamGrades;