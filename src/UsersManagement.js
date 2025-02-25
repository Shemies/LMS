/// add validations for file (type,size)
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
    level: "",
    student: true,
    studentId: "",
  });
//   const [newUser, setNewUser] = useState({
//     name: "",
//     email: "",
//     studentId: "",
//     level: "",
//     student: true,
//   });
  const [importData, setImportData] = useState([]);
  const [fileType, setFileType] = useState("");

  // Fetch users from Firebase
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        setUsers(usersData);
      }
    });
  }, []);

  // Handle CSV file upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const usersData = result.data.map((row) => ({
            name: row[0],
            email: row[1],
            studentId: row[2],
            level: row[3],
            student: row[4] === "true",
          }));
          setImportData(usersData);
        },
      });
    }
  };

  // Handle Excel (XLSX) file upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const usersData = XLSX.utils.sheet_to_json(sheet);
        setImportData(usersData);
      };
      reader.readAsBinaryString(file);
    }
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

  

  // Export users to CSV
  const exportToCSV = () => {
    const usersData = users.map((user) => [
      user.name,
      user.email,
      user.studentId,
      user.level,
      user.student ? "true" : "false",
    ]);
    const csv = Papa.unparse(usersData);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    link.click();
  };

  // Export users to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
  };

  // Start editing a user
  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditData({ ...user });
  };

  // Handle editing form changes
//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditData((prevData) => ({
//       ...prevData,
//       [name]: name === "student" ? value === "true" : value,
//     }));
//   };

  // Save the edited user data
  const saveEdit = (userId) => {
    update(ref(db, `users/${userId}`), editData)
      .then(() => {
        alert("User updated successfully");
        setEditingUserId(null);
      })
      .catch((error) => alert("Error updating user: " + error.message));
  };

  // Delete a user
  const handleDelete = (userId) => {
    remove(ref(db, `users/${userId}`))
      .then(() => alert("User deleted successfully"))
      .catch((error) => alert("Error deleting user: " + error.message));
  };

  return (
    <div className="p-4 bg-gray-700 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>

      {/* Import/Export Section */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">Import & Export Users</h2>
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
      </div>

            <div   style={{background: "red"}}>zead</div>
            <div  className={"bg-red-700"}>shemis</div>
      {/* Users Table */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <table className="w-full border-collapse border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="border border-gray-600 p-2">Name</th>
              <th className="border border-gray-600 p-2">Email</th>
              <th className="border border-gray-600 p-2">Student ID</th>
              <th className="border border-gray-600 p-2">Level</th>
              <th className="border border-gray-600 p-2">Student</th>
              <th className="border border-gray-600 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-600 p-2">{user.name}</td>
                <td className="border border-gray-600 p-2">{user.email}</td>
                <td className="border border-gray-600 p-2">{user.studentId}</td>
                <td className="border border-gray-600 p-2">{user.level}</td>
                <td className="border border-gray-600 p-2">{user.student ? "Yes" : "No"}</td>
                <td className="border border-gray-600 p-2">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm" onClick={() => startEditing(user)}>
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded text-sm" onClick={() => handleDelete(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;
