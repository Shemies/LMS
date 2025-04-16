import React, { useState, useEffect } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "./firebase";

const CoursesManagement = () => {
  const [courses, setCourses] = useState({});
  const [newCourseName, setNewCourseName] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch courses from Firebase
  useEffect(() => {
    const coursesRef = ref(db, "courses");
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      setCourses(snapshot.val() || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    // Use the course name as the ID (with sanitization)
    const courseId = newCourseName.trim().replace(/\s+/g, '_').toUpperCase();
    await set(ref(db, `courses/${courseId}`), {
      name: newCourseName.trim(),
      createdAt: new Date().toISOString()
    });
    setNewCourseName("");
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm(`Are you sure you want to delete "${courses[courseId]?.name}"?`)) {
      await remove(ref(db, `courses/${courseId}`));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="p-4 text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Courses Management</h1>

      {/* Add Course Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
        <form onSubmit={addCourse} className="flex gap-4">
          <input
            type="text"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            placeholder="Enter course name"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
            Add Course
          </button>
        </form>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 font-semibold">
          <div className="col-span-10">Course Name</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        {Object.keys(courses).length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No courses found. Add your first course above.
          </div>
        ) : (
          Object.entries(courses).map(([courseId, course]) => (
            <div 
              key={courseId} 
              className="grid grid-cols-12 gap-4 p-4 border-t border-gray-200 hover:bg-gray-50"
            >
              <div className="col-span-10 font-medium">
                {course.name || courseId.replace(/_/g, ' ')}
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => deleteCourse(courseId)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-right text-gray-600">
        Total courses: {Object.keys(courses).length}
      </div>
    </div>
  );
};

export default CoursesManagement;