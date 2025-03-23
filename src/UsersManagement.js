import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { ref, push, onValue, update, remove } from "firebase/database";
import { db } from "./firebase"; // Adjust the path if necessary

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    student: true,
    studentId: "",
    school: "",
  });
  const [importData, setImportData] = useState([]);
  const [fileType, setFileType] = useState("");
  const [activeCourse, setActiveCourse] = useState("AS"); // Default active course
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState(""); // School filter
  const [studentIdFilter, setStudentIdFilter] = useState(""); // Student ID filter
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isImportExportExpanded, setIsImportExportExpanded] = useState(false); // Expandable box state

  // Fetch all users from Firebase
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id, // Ensure each user has a unique ID
          ...data,
          level: data.enrolledCourse, // Derive level from enrolledCourse
        }));
        setUsers(usersData);
      } else {
        setUsers([]); // Reset users if no data exists
      }
    });
  }, []);

  // Handle editing form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: name === "student" ? value === "true" : value,
    }));
  };

  // Start editing a user
  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditData({ ...user });
  };

  // Save the edited user data
  const saveEdit = () => {
    if (!editingUserId) return;

    update(ref(db, `users/${editingUserId}`), editData)
      .then(() => {
        alert("User updated successfully");
        setEditingUserId(null); // Reset editing state
      })
      .catch((error) => alert("Error updating user: " + error.message));
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
    });
  };

  // Handle CSV file upload with validation
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Invalid file type. Please upload a CSV file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds the limit of 5MB.");
      return;
    }

    Papa.parse(file, {
      complete: (result) => {
        const usersData = result.data.map((row) => ({
          name: row[0],
          email: row[1],
          studentId: row[2],
          enrolledCourse: row[3], // Use enrolledCourse instead of level
          student: row[4] === "true",
          school: row[5],
        }));
        setImportData(usersData);
      },
      error: (error) => {
        alert("Error parsing CSV file: " + error.message);
      },
    });
  };

  // Handle Excel (XLSX) file upload with validation
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (
      file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      !file.name.endsWith(".xlsx")
    ) {
      alert("Invalid file type. Please upload an Excel file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds the limit of 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const usersData = XLSX.utils.sheet_to_json(sheet);
      setImportData(usersData);
    };
    reader.readAsBinaryString(file);
  };

  // Add imported users to Firebase
  const handleAddImportedUsers = () => {
    const usersRef = ref(db, "users");
    importData.forEach((user) => {
      push(usersRef, user)
        .then(() => alert("User added successfully"))
        .catch((error) => alert("Error adding user: " + error.message));
    });
  };

  // Export users to CSV (only selected tab)
  const exportToCSV = () => {
    // Filter users based on the active course
    const usersData = users
      .filter((user) => user.enrolledCourse === activeCourse) // Only include users from the active course
      .map((user) => [
        user.name,
        user.email,
        user.studentId,
        user.enrolledCourse,
        user.student ? "true" : "false",
        user.school,
      ]);

    // Generate CSV
    const csv = Papa.unparse(usersData);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeCourse}_users.csv`; // Name the file based on the active course
    link.click();
  };

  // Export users to Excel (only selected tab)
  const exportToExcel = () => {
    // Filter users based on the active course
    const usersData = users.filter((user) => user.enrolledCourse === activeCourse);

    // Generate Excel file
    const ws = XLSX.utils.json_to_sheet(usersData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `${activeCourse}_users.xlsx`); // Name the file based on the active course
  };

  // Delete a user
  const handleDelete = (userId) => {
    remove(ref(db, `users/${userId}`))
      .then(() => alert("User deleted successfully"))
      .catch((error) => alert("Error deleting user: " + error.message));
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort users
  const sortedUsers = React.useMemo(() => {
    if (!sortConfig.key) return users;

    return [...users].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [users, sortConfig]);

  // Filter users based on search query, course, school, and student ID
  const filteredUsers = React.useMemo(() => {
    return sortedUsers.filter((user) => {
      const matchesCourse = !activeCourse || user.enrolledCourse === activeCourse;
      const matchesSearch = !searchQuery || Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesSchool = !schoolFilter || user.school === schoolFilter;
      const matchesStudentId = !studentIdFilter || String(user.studentId || "").toLowerCase().includes(studentIdFilter.toLowerCase());

      return matchesCourse && matchesSearch && matchesSchool && matchesStudentId;
    });
  }, [sortedUsers, activeCourse, searchQuery, schoolFilter, studentIdFilter]);

  // Get unique schools for the filter dropdown
  const uniqueSchools = [...new Set(users.map((user) => user.school))].filter(Boolean);

  return (
    <div className="p-4 bg-gray-700 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>

      {/* Course Tabs */}
      <div className="flex space-x-4 mb-6">
        
        <button
          className={`p-2 ${activeCourse === "OL" ? "bg-blue-600" : "bg-gray-600"} rounded-md`}
          onClick={() => setActiveCourse("OL")}
        >
          OL Course
        </button>
        <button
          className={`p-2 ${activeCourse === "AS" ? "bg-blue-600" : "bg-gray-600"} rounded-md`}
          onClick={() => setActiveCourse("AS")}
        >
          AS Course
        </button>
      </div>

      {/* Search Bar, School Filter, and Student ID Filter */}
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 bg-gray-800 rounded-md text-white flex-1"
        />
        <input
          type="text"
          placeholder="Search by Student ID..."
          value={studentIdFilter}
          onChange={(e) => setStudentIdFilter(e.target.value)}
          className="p-2 bg-gray-800 rounded-md text-white flex-1"
        />
        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
          className="p-2 bg-gray-800 rounded-md text-white"
        >
          <option value="">All Schools</option>
          {uniqueSchools.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>
      </div>

      {/* Expandable Import/Export Section */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <button
          onClick={() => setIsImportExportExpanded(!isImportExportExpanded)}
          className="w-full p-2 bg-blue-600 rounded-md text-white mb-4 text-sm"
        >
          {isImportExportExpanded ? "Hide Import/Export" : "Show Import/Export"}
        </button>
        {isImportExportExpanded && (
          <>
            <input
              type="file"
              accept=".csv, .xlsx"
              onChange={(e) => {
                const fileType = e.target.files[0]?.name.split(".").pop();
                setFileType(fileType);
                if (fileType === "csv") handleCSVUpload(e);
                else if (fileType === "xlsx") handleExcelUpload(e);
              }}
              className="p-2 bg-gray-700 rounded-md text-white mb-4 text-sm"
            />
            <button onClick={handleAddImportedUsers} className="w-full p-2 bg-green-600 rounded-md text-white mb-4 text-sm">
              Add Imported Users
            </button>
            <button onClick={exportToCSV} className="w-full p-2 bg-blue-600 rounded-md text-white mb-4 text-sm">
              Export to CSV
            </button>
            <button onClick={exportToExcel} className="w-full p-2 bg-blue-600 rounded-md text-white text-sm">
              Export to Excel
            </button>
          </>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white text-black p-4 rounded-lg shadow-md">
        <table className="w-full border-collapse border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-400">
              <th className="border border-gray-600 p-2 cursor-pointer" onClick={() => handleSort("name")}>
                Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="border border-gray-600 p-2 cursor-pointer" onClick={() => handleSort("email")}>
                Email {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="border border-gray-600 p-2 cursor-pointer w-32" onClick={() => handleSort("studentId")}>
                Student ID {sortConfig.key === "studentId" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="border border-gray-600 p-2 cursor-pointer" onClick={() => handleSort("enrolledCourse")}>
                Level {sortConfig.key === "enrolledCourse" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="border border-gray-600 p-2 cursor-pointer w-32" onClick={() => handleSort("school")}>
                School {sortConfig.key === "school" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="border border-gray-600 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                {editingUserId === user.id ? (
                  <>
                    <td className="border border-gray-600 p-2">
                      <input
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="p-1 bg-gray-700 rounded-md text-white"
                      />
                    </td>
                    <td className="border border-gray-600 p-2">
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleEditChange}
                        className="p-1 bg-gray-700 rounded-md text-white"
                      />
                    </td>
                    <td className="border border-gray-600 p-2">
                      <input
                        type="text"
                        name="studentId"
                        value={editData.studentId}
                        onChange={handleEditChange}
                        className="p-1 bg-gray-700 rounded-md text-white"
                      />
                    </td>
                    <td className="border border-gray-600 p-2">
                      <input
                        type="text"
                        name="enrolledCourse"
                        value={editData.enrolledCourse}
                        onChange={handleEditChange}
                        className="p-1 bg-gray-700 rounded-md text-white"
                      />
                    </td>
                    <td className="border border-gray-600 p-2">
                      <input
                        type="text"
                        name="school"
                        value={editData.school}
                        onChange={handleEditChange}
                        className="p-1 bg-gray-700 rounded-md text-white"
                      />
                    </td>
                    <td className="border border-gray-600 p-2">
                      <button className="bg-green-500 text-white px-2 py-1 rounded mr-2 text-sm" onClick={saveEdit}>
                        Save
                      </button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-sm" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-600 p-2">{user.name}</td>
                    <td className="border border-gray-600 p-2">{user.email}</td>
                    <td className="border border-gray-600 p-2 w-32">{user.studentId}</td>
                    <td className="border border-gray-600 p-2">{user.enrolledCourse}</td>
                    <td className="border border-gray-600 p-2 w-32">{user.school}</td>
                    <td className="border border-gray-600 p-2">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm" onClick={() => startEditing(user)}>
                        Edit
                      </button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-sm" onClick={() => handleDelete(user.id)}>
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
    </div>
  );
};

export default UsersManagement;