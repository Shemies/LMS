import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import ImportExportStudents from "./ImportExportStudents";
import StudentsTable from "./StudentsTable";
import AddStudentForm from "./AddStudentForm";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all users and courses from Firebase
  useEffect(() => {
    const usersRef = ref(db, "users");
    const usersListener = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
          student: data.student !== false,
          examGrades: data.examGrades || {},
          homeworkStatus: data.homeworkStatus || {}
        }));
        setUsers(usersData);
      } else {
        setUsers([]);
      }
      setIsLoading(false);
    });

    const coursesRef = ref(db, "courses");
    const coursesListener = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = Object.keys(snapshot.val());
        setCourses(coursesData);
        if (coursesData.length > 0 && !coursesData.includes(activeCourse)) {
          setActiveCourse(coursesData[0]);
        }
      }
    });

    return () => {
      usersListener();
      coursesListener();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // Get unique schools from users
  const uniqueSchools = [...new Set(users.map(u => u.school).filter(Boolean))];

  return (
    <div className="p-4 text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Students Management</h1>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md"
        />
        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">All Schools</option>
          {uniqueSchools.map(school => (
            <option key={school} value={school}>{school}</option>
          ))}
        </select>
        <AddStudentForm 
          courses={courses} 
          activeCourse={activeCourse}
        />
      </div>

      {/* Import/Export Section */}
      <div className="mb-6">
        <ImportExportStudents 
          courses={courses} 
          users={users.filter(u => u.student === true)}
        />
      </div>

      {/* Course Selection Filter */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Select Course</h2>
          <select
            value={activeCourse}
            onChange={(e) => setActiveCourse(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <StudentsTable 
        users={users}
        activeCourse={activeCourse}
        searchQuery={searchQuery}
        schoolFilter={schoolFilter}
        courses={courses}
      />
    </div>
  );
};

export default UsersManagement;