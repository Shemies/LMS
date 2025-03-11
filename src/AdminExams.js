import React, { useState, useEffect } from "react";
import { db, ref, onValue, update, remove } from "./firebase";
import { CSVLink } from "react-csv";
import Papa from "papaparse";

const AdminExamGrades = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchById, setSearchById] = useState("");
  const [newExam, setNewExam] = useState({
    studentId: "",
    examName: "",
    grade: "",
    mark: "",
    totalMark: "",
    comment: "",
  });
  const [editableGrades, setEditableGrades] = useState({});
  const [importExamName, setImportExamName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [isAddGradeCollapsed, setIsAddGradeCollapsed] = useState(true);
  const [isImportExportCollapsed, setIsImportExportCollapsed] = useState(true);

  // Fetch all users and their exam grades
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const formattedUsers = Object.entries(usersData).map(([uid, user]) => ({
          uid,
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
                userId: user.uid,
                studentId: user.studentId,
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
        const matchesId = !searchById || exam.studentId.toString().includes(searchById);
        return matchesSchool && matchesSearch && matchesId;
      })
    : [];

  // Add a new exam to a user's examGrades
  const addExam = async () => {
    const { studentId, examName, grade, mark, totalMark, comment } = newExam;

    // Validate required fields
    if (!studentId || !examName || !grade || !mark || !totalMark) {
      alert("Please fill in all required fields.");
      return;
    }

    // Find the user by studentId
    const user = users.find((u) => u.studentId && u.studentId.toString() === studentId);
    if (!user) {
      alert("Student ID not found.");
      return;
    }

    const path = `users/${user.uid}/examGrades/${examName}`;
    const examData = {
      grade,
      mark: parseFloat(mark),
      totalMark: parseFloat(totalMark),
      comment: comment || "",
    };

    try {
      await update(ref(db, path), examData);
      alert("Exam added successfully!");
      setNewExam({
        studentId: "",
        examName: "",
        grade: "",
        mark: "",
        totalMark: "",
        comment: "",
      });
      setIsAddGradeCollapsed(true);
    } catch (error) {
      console.error("Error adding exam:", error);
      alert("Failed to add exam. Please check the console for details.");
    }
  };

  // Delete an exam from a user's examGrades
  const deleteExam = async (uid, examName) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this exam?");
    if (!confirmDelete) return;

    const path = `users/${uid}/examGrades/${examName}`;
    console.log("Deleting exam at path:", path); // Debugging

    try {
      await remove(ref(db, path));
      alert("Exam deleted successfully!");
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam. Please check the console for details.");
    }
  };

  // Handle CSV Import
  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };

  // Process CSV Import
  const processCSVImport = () => {
    if (!importExamName) {
      alert("Please specify the exam name for the imported grades.");
      return;
    }

    if (!csvFile) {
      alert("Please upload a CSV file.");
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        const updates = {};
        results.data.forEach((row) => {
          if (row.studentId && row.grade && row.mark && row.totalMark) {
            const user = users.find((u) => u.studentId && u.studentId.toString() === row.studentId);
            if (user) {
              const path = `users/${user.uid}/examGrades/${importExamName}`;
              updates[path] = {
                grade: row.grade,
                mark: parseFloat(row.mark),
                totalMark: parseFloat(row.totalMark),
                comment: row.comment || "",
              };
            }
          }
        });

        update(ref(db), updates)
          .then(() => {
            alert("CSV imported successfully!");
            setCsvFile(null);
            setImportExamName("");
          })
          .catch((error) => {
            console.error("Error importing CSV:", error);
            alert("Failed to import CSV. Please check the console for details.");
          });
      },
    });
  };

  // Handle CSV Export
  const handleCSVExport = () => {
    const headers = [
      { label: "Student ID", key: "studentId" },
      { label: "Name", key: "userName" },
      { label: "School", key: "school" },
      { label: "Grade", key: "grade" },
      { label: "Mark", key: "mark" },
      { label: "Total Mark", key: "totalMark" },
      { label: "Comment", key: "comment" },
    ];
    return (
      <CSVLink
        data={filteredExams}
        headers={headers}
        filename={`${selectedCourse}_${selectedExam}_grades.csv`}
        className="bg-green-500 text-white p-2 rounded"
      >
        Export CSV
      </CSVLink>
    );
  };

  // Handle Grade Edit
  const handleGradeEdit = (exam, field, value) => {
    console.log("Editing grade:", exam.userId, selectedExam, field, value); // Debugging
    setEditableGrades((prev) => ({
      ...prev,
      [exam.userId]: {
        ...prev[exam.userId],
        [selectedExam]: {
          ...prev[exam.userId]?.[selectedExam],
          [field]: value,
        },
      },
    }));
  };

  // Save Edits
  const saveEdits = async () => {
    console.log("Saving edits:", editableGrades); // Debugging
    const updates = {};
    Object.entries(editableGrades).forEach(([userId, exams]) => {
      Object.entries(exams).forEach(([examName, fields]) => {
        Object.entries(fields).forEach(([field, value]) => {
          const path = `users/${userId}/examGrades/${examName}/${field}`;
          console.log("Updating path:", path, "with value:", value); // Debugging
          updates[path] = value;
        });
      });
    });

    try {
      await update(ref(db), updates);
      alert("Grades updated successfully!");
      setEditableGrades({});
    } catch (error) {
      console.error("Error updating grades:", error);
      alert("Failed to update grades. Please check the console for details.");
    }
  };

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
              setSelectedExam(null);
            }}
            className={`p-2 rounded-lg ${
              selectedCourse === course ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {course}
          </button>
        ))}
      </div>

      {/* Exam Tabs */}
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
            {[...new Set(users.map((user) => user.school))].map((school, index) => (
              <option key={index} value={school}>{school}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Collapsible Add Exam Section */}
      <div className="bg-white p-4 rounded shadow mb-4 text-black">
        <button
          onClick={() => setIsAddGradeCollapsed(!isAddGradeCollapsed)}
          className="bg-blue-500 text-white p-2 rounded mb-4"
        >
          {isAddGradeCollapsed ? "Add New Exam" : "Collapse"}
        </button>
        {!isAddGradeCollapsed && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Add New Exam</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Student ID"
                value={newExam.studentId}
                onChange={(e) => setNewExam({ ...newExam, studentId: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Exam Name"
                value={newExam.examName}
                onChange={(e) => setNewExam({ ...newExam, examName: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Grade"
                value={newExam.grade}
                onChange={(e) => setNewExam({ ...newExam, grade: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Mark"
                value={newExam.mark}
                onChange={(e) => setNewExam({ ...newExam, mark: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Total Mark"
                value={newExam.totalMark}
                onChange={(e) => setNewExam({ ...newExam, totalMark: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Comment"
                value={newExam.comment}
                onChange={(e) => setNewExam({ ...newExam, comment: e.target.value })}
                className="border p-2 rounded"
              />
            </div>
            <button
              onClick={addExam}
              className="bg-green-500 text-white p-2 rounded mt-4"
            >
              Add Exam
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Import/Export Section */}
      <div className="bg-white p-4 rounded shadow mb-4 text-black">
        <button
          onClick={() => setIsImportExportCollapsed(!isImportExportCollapsed)}
          className="bg-blue-500 text-white p-2 rounded mb-4"
        >
          {isImportExportCollapsed ? "Import/Export Grades" : "Collapse"}
        </button>
        {!isImportExportCollapsed && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Import/Export Grades</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Exam Name"
                value={importExamName}
                onChange={(e) => setImportExamName(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="border p-2 rounded"
              />
              <button
                onClick={processCSVImport}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Import CSV
              </button>
            </div>
            <div className="mt-4">
              {selectedExam && handleCSVExport()}
            </div>
          </div>
        )}
      </div>

      {/* Exam Grades Table */}
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
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam, index) => (
                <tr key={`${exam.userId}_${selectedExam}`}>
                  <td className="border p-2">{exam.studentId}</td>
                  <td className="border p-2">{exam.userName}</td>
                  <td className="border p-2">{exam.school}</td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={editableGrades[exam.userId]?.[selectedExam]?.grade || exam.grade}
                      onChange={(e) => handleGradeEdit(exam, "grade", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={editableGrades[exam.userId]?.[selectedExam]?.mark || exam.mark}
                      onChange={(e) => handleGradeEdit(exam, "mark", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={editableGrades[exam.userId]?.[selectedExam]?.totalMark || exam.totalMark}
                      onChange={(e) => handleGradeEdit(exam, "totalMark", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={editableGrades[exam.userId]?.[selectedExam]?.comment || exam.comment || ""}
                      onChange={(e) => handleGradeEdit(exam, "comment", e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => deleteExam(exam.userId, selectedExam)}
                      className="bg-red-500 text-white p-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={saveEdits}
            className="bg-blue-500 text-white p-2 rounded mt-4"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminExamGrades;