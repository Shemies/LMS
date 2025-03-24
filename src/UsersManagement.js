import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { ref, push, onValue, update, remove } from "firebase/database";
import { db } from "./firebase";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const UsersManagement = () => {
  // State declarations
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    student: true,
    studentId: "",
    school: "",
    enrolledCourse: "",
    examGrades: {},
    homeworkStatus: {}
  });
  const [importData, setImportData] = useState([]);
  const [fileType, setFileType] = useState("");
  const [activeCourse, setActiveCourse] = useState("OL");
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [studentIdFilter, setStudentIdFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isImportExportExpanded, setIsImportExportExpanded] = useState(false);
  const [isAddUserExpanded, setIsAddUserExpanded] = useState(false);

  // Fetch all users from Firebase
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
          student: data.student !== false, // Default to true if not set
          examGrades: data.examGrades || {},
          homeworkStatus: data.homeworkStatus || {}
        }));
        setUsers(usersData);
      } else {
        setUsers([]);
      }
    });
  }, []);

  // Handle form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === "student" ? value === "true" : value
    }));
  };

  // Start editing a user
  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditData({
      name: user.name || "",
      email: user.email || "",
      student: user.student !== false,
      studentId: user.studentId || "",
      school: user.school || "",
      enrolledCourse: user.enrolledCourse || "",
      examGrades: user.examGrades || {},
      homeworkStatus: user.homeworkStatus || {}
    });
  };

  // Save user data
  const saveEdit = () => {
    if (!editingUserId) return;

    const userData = {
      ...editData,
      student: editData.student !== false // Ensure student field is properly set
    };

    update(ref(db, `users/${editingUserId}`), userData)
      .then(() => {
        alert("User updated successfully");
        setEditingUserId(null);
      })
      .catch(error => alert("Error updating user: " + error.message));
  };

  // Add new user
  const addNewUser = () => {
    if (!editData.name || !editData.email) {
      alert("Name and email are required");
      return;
    }

    const userData = {
      ...editData,
      student: true, // Default to true for new students
      examGrades: {},
      homeworkStatus: {}
    };

    push(ref(db, "users"), userData)
      .then(() => {
        alert("User added successfully");
        setIsAddUserExpanded(false);
        setEditData({
          name: "",
          email: "",
          student: true,
          studentId: "",
          school: "",
          enrolledCourse: "",
          examGrades: {},
          homeworkStatus: {}
        });
      })
      .catch(error => alert("Error adding user: " + error.message));
  };

  // Handle adding imported users
const handleAddImportedUsers = () => {
  const usersRef = ref(db, "users");
  const updates = {};
  
  importData.forEach((user) => {
    const newUserRef = push(usersRef);
    updates[newUserRef.key] = {
      ...user,
      student: user.student !== false,
      examGrades: {},
      homeworkStatus: {}
    };
  });

  update(ref(db), updates)
    .then(() => {
      alert(`${importData.length} users added successfully`);
      setImportData([]);
    })
    .catch((error) => {
      alert("Error adding users: " + error.message);
    });
};  // <-- Properly closed function

// Cancel editing
const cancelEdit = () => {
  setEditingUserId(null);
  setEditData({
    name: "",
    email: "",
    student: true,
    studentId: "",
    school: "",
    enrolledCourse: "",
    examGrades: {},
    homeworkStatus: {}
  });
};
  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  // File import handlers
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const usersData = result.data.map(row => ({
          name: row.name || row.Name || "",
          email: row.email || row.Email || "",
          studentId: row.studentId || row.StudentID || "",
          enrolledCourse: row.enrolledCourse || row.Course || "OL",
          student: row.student ? row.student === "true" : true, // Default to true
          school: row.school || row.School || "",
          examGrades: {},
          homeworkStatus: {}
        }));
        setImportData(usersData);
      },
      error: (error) => alert("Error parsing CSV: " + error.message)
    });
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const usersData = XLSX.utils.sheet_to_json(sheet).map(row => ({
        name: row.name || row.Name || "",
        email: row.email || row.Email || "",
        studentId: row.studentId || row.StudentID || "",
        enrolledCourse: row.enrolledCourse || row.Course || "OL",
        student: row.student ? row.student === "true" : true, // Default to true
        school: row.school || row.School || "",
        examGrades: {},
        homeworkStatus: {}
      }));
      setImportData(usersData);
    };
    reader.readAsArrayBuffer(file);
  };

  importData.forEach((user) => {
    const newUserRef = push(usersRef);
    updates[newUserRef.key] = {
      ...user,
      student: user.student !== false, // Ensure student is true if not specified
      examGrades: {},
      homeworkStatus: {}
    };
  });

  update(ref(db), updates)
    .then(() => {
      alert(`${importData.length} users added successfully`);
      setImportData([]);
    })
    .catch((error) => {
      alert("Error adding users: " + error.message);
    });
};

// Cancel editing
const cancelEdit = () => {
  setEditingUserId(null);
  setEditData({
    name: "",
    email: "",
    student: true,
    studentId: "",
    school: "",
    enrolledCourse: "",
    examGrades: {},
    homeworkStatus: {}
  });
};

  // Export functions
  const exportToCSV = () => {
    const usersData = filteredUsers.map(user => ({
      Name: user.name,
      Email: user.email,
      StudentID: user.studentId,
      Course: user.enrolledCourse,
      School: user.school,
      IsStudent: user.student ? "true" : "false"
    }));

    const csv = Papa.unparse(usersData);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeCourse}_users_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    const usersData = filteredUsers.map(user => ({
      Name: user.name,
      Email: user.email,
      StudentID: user.studentId,
      Course: user.enrolledCourse,
      School: user.school,
      IsStudent: user.student ? "true" : "false"
    }));

    const ws = XLSX.utils.json_to_sheet(usersData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `${activeCourse}_users_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Sorting and filtering
  const sortedUsers = React.useMemo(() => {
    if (!sortConfig.key) return users;
    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      return sortConfig.direction === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    });
  }, [users, sortConfig]);

  const filteredUsers = React.useMemo(() => {
    return sortedUsers.filter(user => {
      const matchesCourse = !activeCourse || user.enrolledCourse === activeCourse;
      const matchesSearch = !searchQuery || 
        Object.values(user).some(val => 
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesSchool = !schoolFilter || user.school === schoolFilter;
      const matchesStudentId = !studentIdFilter || 
        String(user.studentId || "").includes(studentIdFilter);
      
      return matchesCourse && matchesSearch && matchesSchool && matchesStudentId;
    });
  }, [sortedUsers, activeCourse, searchQuery, schoolFilter, studentIdFilter]);

  const uniqueSchools = [...new Set(users.map(u => u.school).filter(Boolean))];

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Users Management</h1>

      {/* Course Tabs */}
      <div className="flex space-x-2 mb-6 bg-white p-2 rounded-lg shadow">
        {["OL", "AS"].map(course => (
          <button
            key={course}
            onClick={() => setActiveCourse(course)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeCourse === course 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {course} Course
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Search by Student ID"
          value={studentIdFilter}
          onChange={(e) => setStudentIdFilter(e.target.value)}
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
        <button
          onClick={() => setIsAddUserExpanded(!isAddUserExpanded)}
          className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
        >
          {isAddUserExpanded ? "Cancel" : "Add New Student"}
        </button>
      </div>

      {/* Add User Form */}
      {isAddUserExpanded && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Student ID</label>
              <input
                type="text"
                name="studentId"
                value={editData.studentId}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <input
                type="text"
                name="school"
                value={editData.school}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course</label>
              <select
                name="enrolledCourse"
                value={editData.enrolledCourse}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="OL">OL</option>
                <option value="AS">AS</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setIsAddUserExpanded(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={addNewUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Student
            </button>
          </div>
        </div>
      )}

      {/* Import/Export Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <button
          onClick={() => setIsImportExportExpanded(!isImportExportExpanded)}
          className="w-full text-left p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex justify-between items-center"
        >
          <span>Import/Export Users</span>
          <span>{isImportExportExpanded ? "▲" : "▼"}</span>
        </button>
        {isImportExportExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-2">Import Users</h3>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={(e) => {
                  const ext = e.target.files[0]?.name.split(".").pop();
                  setFileType(ext);
                  if (ext === "csv") handleCSVUpload(e);
                  else if (ext === "xlsx") handleExcelUpload(e);
                }}
                className="mb-2 w-full"
              />
              <p className="text-sm text-gray-600 mb-2">
                File should include: Name, Email, StudentID, Course, School columns
              </p>
              {importData.length > 0 && (
                <button
                  onClick={handleAddImportedUsers}
                  className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 w-full"
                >
                  Import {importData.length} Users
                </button>
              )}
            </div>
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-2">Export Users</h3>
              <button
                onClick={exportToCSV}
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 w-full mb-2"
              >
                Export to CSV
              </button>
              <button
                onClick={exportToExcel}
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 w-full"
              >
                Export to Excel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  Email {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("studentId")}
                >
                  Student ID {sortConfig.key === "studentId" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("enrolledCourse")}
                >
                  Course {sortConfig.key === "enrolledCourse" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("school")}
                >
                  School {sortConfig.key === "school" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {editingUserId === user.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          className="p-1 border rounded w-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                          className="p-1 border rounded w-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="studentId"
                          value={editData.studentId}
                          onChange={handleEditChange}
                          className="p-1 border rounded w-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="enrolledCourse"
                          value={editData.enrolledCourse}
                          onChange={handleEditChange}
                          className="p-1 border rounded w-full"
                        >
                          <option value="OL">OL</option>
                          <option value="AS">AS</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="school"
                          value={editData.school}
                          onChange={handleEditChange}
                          className="p-1 border rounded w-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.enrolledCourse === "OL" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}>
                          {user.enrolledCourse}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.school}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => startEditing(user)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${user.name}?`)) {
                              remove(ref(db, `users/${user.id}`));
                            }
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No users found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;