import React, { useState } from "react";
import { ref, update, remove, get } from "firebase/database";
import { db } from "./firebase";
import { generateStudentReport } from "./StudentReport";

const StudentsTable = ({ users, activeCourse, searchQuery, schoolFilter, courses }) => {
  // Removed editing state since we don't need edit functionality
  const filteredUsers = users.filter(user => {
    const matchesCourse = !activeCourse || user.enrolledCourse === activeCourse;
    const matchesSearch = !searchQuery || 
      ['name', 'email', 'phone', 'parentPhone', 'school', 'studentId'].some(field => 
        String(user[field] || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesSchool = !schoolFilter || user.school === schoolFilter;
    const isStudent = user.student === true;
    
    return matchesCourse && matchesSearch && matchesSchool && isStudent;
  });

  const deleteUser = async (userId, studentId, name, enrolledCourse) => {
    if (!window.confirm(`Are you sure you want to delete ${name} (ID: ${studentId})?`)) {
      return;
    }

    try {
      await remove(ref(db, `users/${userId}`));
      
      if (enrolledCourse) {
        await remove(ref(db, `courses/${enrolledCourse}/students/${userId}`));
      }
      
      alert(`${name} deleted successfully`);
    } catch (error) {
      alert("Error deleting student: " + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-300 text-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Parent Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono">{user.studentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.parentPhone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.school}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.enrolledCourse}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => deleteUser(user.id, user.studentId, user.name, user.enrolledCourse)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => generateStudentReport(user, db)}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                      title="Generate Report"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  {activeCourse 
                    ? "No students found matching your criteria" 
                    : "Please select a course to view students"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;