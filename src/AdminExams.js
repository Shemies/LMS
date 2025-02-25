import React, { useState, useEffect } from "react";
import { db, ref, push, onValue, remove, update, off } from "./firebase";

const AdminExamGrades = () => {
  const [exams, setExams] = useState({});
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newExamName, setNewExamName] = useState("");
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    studentName: "",
    mark: "",
    grade: "",
    school: "",
  });

  // Fetch all exams from database
  useEffect(() => {
    const examsRef = ref(db, "examGrades");
    onValue(examsRef, (snapshot) => {
      if (snapshot.exists()) {
        setExams(snapshot.val());
      } else {
        setExams({});
      }
    });
  }, []);

  // Fetch students dynamically when an exam is selected
  useEffect(() => {
    if (selectedExam) {
      const studentsRef = ref(db, `examGrades/${selectedExam}/data`);
      const unsubscribe = onValue(studentsRef, (snapshot) => {
        if (snapshot.exists()) {
          setStudents(Object.entries(snapshot.val()));
        } else {
          setStudents([]);
        }
      });

      return () => off(studentsRef); // Cleanup listener when unmounting or switching exams
    }
  }, [selectedExam]);

  // Select exam and trigger real-time updates
  const handleExamSelect = (examId) => {
    setSelectedExam(examId);
  };

  // Add new exam
  const handleAddExam = () => {
    if (newExamName) {
      push(ref(db, "examGrades"), { name: newExamName, data: {} });
      setNewExamName("");
    }
  };

  // Delete exam
  const handleDeleteExam = (examId) => {
    remove(ref(db, `examGrades/${examId}`));
    setSelectedExam(null);
  };

  // Add student mark
  const handleAddMark = () => {
    if (selectedExam && newStudent.studentId && newStudent.studentName) {
      const studentRef = ref(db, `examGrades/${selectedExam}/data`);
      push(studentRef, newStudent);
      setNewStudent({ studentId: "", studentName: "", mark: "", grade: "", school: "" });
    }
  };

  // Delete student mark
  const handleDeleteMark = (studentKey) => {
    remove(ref(db, `examGrades/${selectedExam}/data/${studentKey}`));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Exams Grades</h1>

      {/* Add Exam */}
      <div className="bg-white p-4 rounded shadow mb-4 text-black">
        <input
          type="text"
          placeholder="New Exam Name"
          value={newExamName}
          onChange={(e) => setNewExamName(e.target.value)}
          className="border p-2 rounded mr-2"
        />
        <button onClick={handleAddExam} className="bg-blue-500 text-white p-2 rounded">Add Exam</button>
      </div>

      {/* Exam Tabs */}
      <div className="flex gap-2 overflow-auto mb-4 text-black">
        {Object.entries(exams).map(([examId, exam]) => (
          <button
            key={examId}
            onClick={() => handleExamSelect(examId)}
            className={`p-2 rounded-lg ${selectedExam === examId ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {exam.name} <span onClick={() => handleDeleteExam(examId)} className="text-red-500 ml-2">✖</span>
          </button>
        ))}
      </div>

      {/* Student List */}
      {selectedExam && (
        <div className="bg-white p-4 rounded shadow text-black">
          <h2 className="text-xl font-semibold mb-2">Exam Grades</h2>

          {/* Filters */}
          <input
            type="text"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded mb-2 w-full"
          />
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="border p-2 rounded mb-2 w-full"
          >
            <option value="">All Schools</option>
            {[...new Set(students.map(([_, student]) => student.school))].map((school) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>

          {/* Table */}
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Mark</th>
                <th className="border p-2">Grade</th>
                <th className="border p-2">School</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students
                .filter(([_, student]) =>
                  (!schoolFilter || student.school === schoolFilter) &&
                  (!searchQuery || student.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(([studentKey, student]) => (
                  <tr key={studentKey}>
                    <td className="border p-2">{student.studentId}</td>
                    <td className="border p-2">{student.studentName}</td>
                    <td className="border p-2">{student.mark}</td>
                    <td className="border p-2">{student.grade}</td>
                    <td className="border p-2">{student.school}</td>
                    <td className="border p-2 text-red-500 cursor-pointer" onClick={() => handleDeleteMark(studentKey)}>✖</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Add Student Form */}
          <div className="mt-4">
            <h3 className="font-semibold">Add Student Mark</h3>
            <input type="text" placeholder="ID" className="border p-2 max-w-20 rounded mr-2" value={newStudent.studentId} onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })} />
            <input type="text" placeholder="Name" className="border p-2 rounded mr-2" value={newStudent.studentName} onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })} />
            <input type="number" placeholder="Mark" className="border max-w-20 p-2 rounded mr-2" value={newStudent.mark} onChange={(e) => setNewStudent({ ...newStudent, mark: e.target.value })} />
            <input type="text" placeholder="School" className="border p-2 rounded mr-2" value={newStudent.school} onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })} />
            <input type="text" placeholder="Grade" className="border max-w-20 p-2 rounded mr-2" value={newStudent.grade} onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })} />
            <button onClick={handleAddMark} className="bg-blue-500 text-white p-2 rounded">Add</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamGrades;
