import React, { useState } from "react";
import { ref, push, update, get } from "firebase/database"; // Added 'get' to imports
import { db } from "./firebase";

const AddStudentForm = ({ courses, activeCourse }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    parentPhone: "",
    school: "",
    enrolledCourse: activeCourse || ""
  });

  const getNextStudentId = async () => {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef); // Now using the imported 'get' function
    if (snapshot.exists()) {
      const users = Object.values(snapshot.val());
      const maxId = users.reduce((max, user) => {
        const num = parseInt(user.studentId?.replace(/\D/g, '') || "0");
        return num > max ? num : max;
      }, 0);
      return (maxId + 1).toString().padStart(4, '0');
    }
    return "0001";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addNewUser = async () => {
    if (!formData.name || !formData.email || !formData.enrolledCourse) {
      alert("Name, email, and course are required");
      return;
    }

    try {
      const studentId = await getNextStudentId();
      const userData = {
        ...formData,
        student: true,
        studentId,
        examGrades: {},
        homeworkStatus: {}
      };

      const newUserRef = push(ref(db, "users"));
      await update(newUserRef, userData);
      
      await update(ref(db, `courses/${formData.enrolledCourse}/students/${newUserRef.key}`), {
        name: userData.name,
        studentId: userData.studentId
      });

      alert(`Student added successfully with ID: ${studentId}`);
      setIsExpanded(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        parentPhone: "",
        school: "",
        enrolledCourse: activeCourse || ""
      });
    } catch (error) {
      alert("Error adding student: " + error.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
        disabled={!activeCourse}
        title={!activeCourse ? "Please select a course first" : ""}
      >
        {isExpanded ? "Cancel" : "Add New Student"}
      </button>

      {isExpanded && (
        <div className="col-span-3 bg-white p-4 rounded-lg shadow-md mt-4">
          <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parent Phone</label>
              <input
                type="text"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course*</label>
              <select
                name="enrolledCourse"
                value={formData.enrolledCourse}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addNewUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={!formData.name || !formData.email || !formData.enrolledCourse}
            >
              Add Student
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddStudentForm;