import React, { useState, useEffect } from "react";
import { db, ref, onValue, query, orderByChild, equalTo } from "./firebase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const AdminStudentReport = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all students
  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const formattedStudents = Object.entries(usersData)
          .filter(([_, user]) => user.student) // Only students
          .map(([uid, user]) => ({
            uid,
            ...user,
            studentId: user.studentId || "N/A"
          }));
        setStudents(formattedStudents);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.studentId.toString().toLowerCase().includes(searchLower)
    );
  });

  // Generate PDF report
  const generateReport = () => {
    if (!selectedStudent) return;

    setLoading(true);
    const doc = new jsPDF();

    // Student Information Header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(`Student Report: ${selectedStudent.name}`, 14, 20);

    // Basic Info Section
    doc.setFontSize(12);
    doc.text(`Student ID: ${selectedStudent.studentId}`, 14, 30);
    doc.text(`Email: ${selectedStudent.email || "N/A"}`, 14, 36);
    doc.text(`School: ${selectedStudent.school || "N/A"}`, 14, 42);
    doc.text(`Course: ${selectedStudent.enrolledCourse || "N/A"}`, 14, 48);

    // Exam Grades Table
    if (selectedStudent.examGrades) {
      doc.setFontSize(14);
      doc.text("Exam Grades", 14, 60);
      
      const examData = Object.entries(selectedStudent.examGrades).map(([examName, exam]) => [
        examName,
        exam.grade || "N/A",
        exam.mark || "N/A",
        exam.totalMark || "N/A",
        exam.comment || "No comments"
      ]);

      autoTable(doc, {
        startY: 65,
        head: [['Exam', 'Grade', 'Mark', 'Total', 'Comments']],
        body: examData,
        styles: {
          cellPadding: 3,
          fontSize: 10,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 'auto' }
        }
      });
    } else {
      doc.text("No exam grades available", 14, 60);
    }

    // Homework Status Table
    if (selectedStudent.homeworkStatus) {
      const currentY = doc.lastAutoTable?.finalY || 70;
      doc.setFontSize(14);
      doc.text("Homework Status", 14, currentY + 10);
      
      // Get all homeworks from the course
      const homeworksRef = ref(db, `courses/${selectedStudent.enrolledCourse}/homeworks`);
      onValue(homeworksRef, (snapshot) => {
        if (snapshot.exists()) {
          const homeworksData = snapshot.val();
          const homeworkStatusData = Object.entries(homeworksData).map(([hwId, hw]) => [
            hw.title || "Untitled",
            hw.dueDate || "N/A",
            selectedStudent.homeworkStatus[hwId] || "missing",
            selectedStudent.homeworkStatus[hwId] === "done" ? "Yes" : "No"
          ]);

          autoTable(doc, {
            startY: currentY + 15,
            head: [['Homework', 'Due Date', 'Status', 'Submitted']],
            body: homeworkStatusData,
            styles: {
              cellPadding: 3,
              fontSize: 10,
              valign: 'middle'
            },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 30 },
              2: { cellWidth: 30 },
              3: { cellWidth: 20 }
            },
            didParseCell: (data) => {
              if (data.column.index === 2) { // Status column
                const status = data.cell.raw.toLowerCase();
                if (status === 'done') {
                  data.cell.styles.fillColor = [220, 255, 220];
                } else if (status === 'incomplete') {
                  data.cell.styles.fillColor = [255, 255, 200];
                } else {
                  data.cell.styles.fillColor = [255, 220, 220];
                }
              }
            }
          });

          // Finalize and save PDF
          const date = new Date().toLocaleDateString();
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(`Report generated on ${date}`, 14, doc.lastAutoTable.finalY + 15);
          
          doc.save(`Student_Report_${selectedStudent.name.replace(/\s+/g, '_')}_${date}.pdf`);
          setLoading(false);
        }
      });
    } else {
      doc.text("No homework status available", 14, 70);
      const date = new Date().toLocaleDateString();
      doc.text(`Report generated on ${date}`, 14, 80);
      doc.save(`Student_Report_${selectedStudent.name.replace(/\s+/g, '_')}_${date}.pdf`);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Student Reports</h1>
      
      {/* Search Section */}
      <div className="bg-white p-4  rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Students</h2>
        <input
          type="text"
          placeholder="Search by name or student ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full max-w-md mb-4"
        />
        
        {/* Student Results */}
        {filteredStudents.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border rounded">
            {filteredStudents.map(student => (
              <div 
                key={student.uid}
                onClick={() => setSelectedStudent(student)}
                className={`p-3 text-black border-b cursor-pointer hover:bg-gray-100 ${
                  selectedStudent?.uid === student.uid ? "bg-blue-100" : ""
                }`}
              >
                <div className="font-medium">{student.name}</div>
                <div className="text-sm text-gray-600">ID: {student.studentId} | {student.school || "No school"}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No students found matching your search</p>
        )}
      </div>
      
      {/* Selected Student Info */}
      {selectedStudent && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{selectedStudent.name}</h2>
              <p className="text-gray-600">ID: {selectedStudent.studentId}</p>
              <p className="text-gray-600">{selectedStudent.school || "No school"} - {selectedStudent.enrolledCourse || "No course"}</p>
            </div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              {loading ? (
                "Generating..."
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export PDF Report
                </>
              )}
            </button>
          </div>
          
          {/* Exam Grades Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Exam Grades</h3>
            {selectedStudent.examGrades ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border text-left">Exam</th>
                      <th className="p-2 border text-center">Grade</th>
                      <th className="p-2 border text-center">Mark</th>
                      <th className="p-2 border text-center">Total</th>
                      <th className="p-2 border text-left">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedStudent.examGrades).map(([examName, exam]) => (
                      <tr key={examName} className="border-b">
                        <td className="p-2 border">{examName}</td>
                        <td className="p-2 border text-center font-bold">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            exam.grade === "A" ? "bg-green-500 text-white" :
                            exam.grade === "B" ? "bg-blue-500 text-white" :
                            exam.grade === "C" ? "bg-yellow-500 text-white" :
                            exam.grade === "D" ? "bg-orange-500 text-white" :
                            "bg-red-500 text-white"
                          }`}>
                            {exam.grade}
                          </span>
                        </td>
                        <td className="p-2 border text-center">{exam.mark}</td>
                        <td className="p-2 border text-center">{exam.totalMark}</td>
                        <td className="p-2 border">{exam.comment || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No exam grades available</p>
            )}
          </div>
          
          {/* Homework Status Preview */}
          <div>
            <h3 className="text-lg font-medium mb-2">Homework Status</h3>
            {selectedStudent.homeworkStatus ? (
              <p className="text-gray-500">Homework status will be included in the PDF report</p>
            ) : (
              <p className="text-gray-500">No homework status available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentReport;