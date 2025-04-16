import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { ref, push, update, get } from "firebase/database"; // Changed from onValue to get
import { db } from "./firebase";

const ImportExportStudents = ({ courses, users }) => {
  const [isImportExpanded, setIsImportExpanded] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importCourse, setImportCourse] = useState("");
  const [importSchool, setImportSchool] = useState("");
  const fileInputRef = useRef(null);

  const getNextStudentId = async () => {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef); // Changed from onValue to get
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

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const usersData = jsonData
          .filter(row => (row.Name || row.name) && (row.Email || row.email))
          .map(row => ({
            name: row.Name || row.name || "",
            email: row.Email || row.email || "",
            phone: row.Phone || row.phone || "",
            parentPhone: row["Parent Phone"] || row.parentPhone || "",
            school: importSchool || "",
            enrolledCourse: importCourse || "",
            student: true,
            examGrades: {},
            homeworkStatus: {}
          }));
        
        setImportData(usersData);
      } catch (error) {
        alert("Error parsing Excel file: " + error.message);
      }
    };
    reader.onerror = () => alert("Error reading file");
    reader.readAsArrayBuffer(file);
  };

  const handleAddImportedUsers = async () => {
    if (importData.length === 0) {
      alert("No valid data to import");
      return;
    }

    if (!importCourse) {
      alert("Please select a course to import into");
      return;
    }

    try {
      const usersRef = ref(db, "users");
      const lastId = await getNextStudentId();
      let nextIdNum = parseInt(lastId);
      
      const updates = {};
      const courseUpdates = {};
      
      importData.forEach(user => {
        const newUserRef = push(usersRef).key;
        const studentId = nextIdNum.toString().padStart(4, '0');
        
        updates[`users/${newUserRef}`] = {
          ...user,
          studentId,
          student: true,
          enrolledCourse: importCourse,
          school: importSchool
        };
        
        courseUpdates[`courses/${importCourse}/students/${newUserRef}`] = {
          name: user.name,
          studentId
        };
        
        nextIdNum++;
      });

      await update(ref(db), updates);
      await update(ref(db), courseUpdates);
      
      const startId = (nextIdNum - importData.length).toString().padStart(4, '0');
      const endId = (nextIdNum - 1).toString().padStart(4, '0');
      
      alert(`${importData.length} students imported successfully with IDs ${startId}-${endId}`);
      setImportData([]);
      setImportCourse("");
      setImportSchool("");
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      alert("Error importing students: " + error.message);
      console.error("Import error:", error);
    }
  };

  const exportToExcel = () => {
    const students = users.filter(user => user.student === true);
    
    if (students.length === 0) {
      alert("No students to export");
      return;
    }

    const studentsData = students.map(student => ({
      Name: student.name,
      Email: student.email,
      Phone: student.phone,
      "Parent Phone": student.parentPhone,
      StudentID: student.studentId,
      School: student.school,
      Course: student.enrolledCourse
    }));

    const ws = XLSX.utils.json_to_sheet(studentsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `students_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Import/Export Students</h2>
        <button
          onClick={exportToExcel}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          disabled={users.filter(u => u.student === true).length === 0}
        >
          Export to Excel
        </button>
      </div>

      <button
        onClick={() => setIsImportExpanded(!isImportExpanded)}
        className="w-full text-left p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex justify-between items-center"
      >
        <span>Import Students</span>
        <span>{isImportExpanded ? "▲" : "▼"}</span>
      </button>

      {isImportExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Import to Course*</label>
              <select
                value={importCourse}
                onChange={(e) => setImportCourse(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Import to School</label>
              <input
                type="text"
                value={importSchool}
                onChange={(e) => setImportSchool(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter school name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excel File (Name and Email columns required)</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleExcelUpload}
              className="mb-2 w-full"
            />
            <p className="text-xs text-gray-500">
              Required columns: Name, Email. Optional: Phone, Parent Phone
            </p>
          </div>
          {importData.length > 0 && (
            <div>
              <p className="text-sm mb-2">Found {importData.length} students to import</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setImportData([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddImportedUsers}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex-1"
                  disabled={!importCourse}
                >
                  Import Students
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportExportStudents;