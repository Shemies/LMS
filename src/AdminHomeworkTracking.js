import React, { useState, useEffect } from "react";
import { db, ref, onValue, update } from "./firebase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const AdminHomeworkTracking = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all users and courses
  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const formattedUsers = Object.entries(usersData).map(([uid, user]) => ({
          uid,
          ...user,
        }));
        setUsers(formattedUsers);

        // Get unique courses from users
        const uniqueCourses = [...new Set(
          formattedUsers
            .filter(user => user.enrolledCourse)
            .map(user => user.enrolledCourse)
        )];
        setCourses(uniqueCourses);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch homeworks when course changes
  useEffect(() => {
    if (selectedCourse) {
      const homeworksRef = ref(db, `courses/${selectedCourse}/homeworks`);
      const unsubscribe = onValue(homeworksRef, (snapshot) => {
        if (snapshot.exists()) {
          const homeworksData = snapshot.val();
          const formattedHomeworks = Object.entries(homeworksData).map(([id, hw]) => ({
            id,
            ...hw,
          }));
          setHomeworks(formattedHomeworks);
        } else {
          setHomeworks([]);
        }
      });

      return () => unsubscribe();
    }
  }, [selectedCourse]);

  // Get unique schools for the selected course
  const getSchools = () => {
    if (!selectedCourse) return [];
    return [...new Set(
      users
        .filter(user => user.enrolledCourse === selectedCourse && user.school)
        .map(user => user.school)
    )];
  };

  // Filter students based on selected course, school, and search query
  const filteredStudents = users.filter(user => {
    const matchesCourse = selectedCourse ? user.enrolledCourse === selectedCourse : true;
    const matchesSchool = selectedSchool ? user.school === selectedSchool : true;
    const matchesSearch = searchQuery ? 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (user.studentId && user.studentId.toString().includes(searchQuery)) : true;
    
    return matchesCourse && matchesSchool && matchesSearch && user.student;
  });

  // Handle status change
  const handleStatusChange = (userId, status) => {
    setStatusUpdates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [selectedHomework.id]: status
      }
    }));
  };

  // Save status updates to Firebase
  const saveStatusUpdates = async () => {
    const updates = {};
    
    Object.entries(statusUpdates).forEach(([userId, homeworkStatuses]) => {
      Object.entries(homeworkStatuses).forEach(([homeworkId, status]) => {
        const path = `users/${userId}/homeworkStatus/${homeworkId}`;
        updates[path] = status;
      });
    });

    try {
      await update(ref(db), updates);
      alert("Homework statuses updated successfully!");
      setStatusUpdates({});
    } catch (error) {
      console.error("Error updating homework statuses:", error);
      alert("Failed to update statuses. Please check console for details.");
    }
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text(`Homework Completion Report - ${selectedCourse}`, 14, 20);
      
      // Homework Info
      doc.setFontSize(12);
      doc.text(`Homework: ${selectedHomework.title}`, 14, 30);
      doc.text(`Due Date: ${selectedHomework.dueDate}`, 14, 36);
      doc.text(`School: ${selectedSchool || "All Schools"}`, 14, 42);
      
      // Table data
      const tableData = filteredStudents.map(student => {
        const status = 
          statusUpdates[student.uid]?.[selectedHomework.id] || 
          student.homeworkStatus?.[selectedHomework.id] || 
          "missing";
        
        return [
          student.studentId || "N/A",
          student.name,
          student.school || "N/A",
          status.charAt(0).toUpperCase() + status.slice(1)
        ];
      });
      
      // Add table using autoTable
      autoTable(doc, {
        head: [['Student ID', 'Name', 'School', 'Status']],
        body: tableData,
        startY: 50,
        styles: {
          cellPadding: 3,
          fontSize: 10,
          valign: 'middle',
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 25 }
        },
        didParseCell: (data) => {
          if (data.column.index === 3) {
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
      
      // Footer
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Report generated on ${date}`, 14, doc.lastAutoTable.finalY + 15);
      
      // Save the PDF
      doc.save(`Homework_Report_${selectedHomework.title.replace(/\s+/g, '_')}_${date}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check console for details.");
    }
  };

  return (
    <div className="p-4 bg-gray-700 text-white min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Homework Tracking</h1>

      {/* Course Selection */}
      <div className="bg-white p-4 rounded shadow mb-4 text-black">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Select Course</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {courses.map(course => (
            <button
              key={course}
              onClick={() => {
                setSelectedCourse(course);
                setSelectedSchool("");
                setSelectedHomework(null);
              }}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg whitespace-nowrap ${
                selectedCourse === course ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {course}
            </button>
          ))}
        </div>
      </div>

      {/* School Selection */}
      {selectedCourse && (
        <div className="bg-white p-4 rounded shadow mb-4 text-black">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Select School</h2>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="border p-2 rounded w-full max-w-md"
          >
            <option value="">All Schools</option>
            {getSchools().map((school, index) => (
              <option key={index} value={school}>{school}</option>
            ))}
          </select>
        </div>
      )}

      {/* Homework Selection */}
      {selectedSchool && (
        <div className="bg-white p-4 rounded shadow mb-4 text-black">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Select Homework</h2>
          <select
            value={selectedHomework?.id || ""}
            onChange={(e) => {
              const hwId = e.target.value;
              const hw = homeworks.find(h => h.id === hwId);
              setSelectedHomework(hw);
            }}
            className="border p-2 rounded w-full max-w-md"
          >
            <option value="">Select Homework</option>
            {homeworks.map(hw => (
              <option key={hw.id} value={hw.id}>{hw.title} (Due: {hw.dueDate})</option>
            ))}
          </select>
        </div>
      )}

      {/* Search Bar */}
      {selectedHomework && (
        <div className="bg-white p-4 rounded shadow mb-4 text-black">
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full max-w-md"
          />
        </div>
      )}

      {/* Students List */}
      {selectedHomework && (
        <div className="bg-white p-2 md:p-4 rounded shadow text-black overflow-x-auto">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            <span className="block md:inline">{selectedHomework.title}</span>
            <span className="block text-sm md:inline md:ml-2">- {selectedSchool || "All Schools"}</span>
            <span className="block md:float-right text-sm font-normal mt-1 md:mt-0">
              Due: {selectedHomework.dueDate}
            </span>
          </h2>
          
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left hidden sm:table-cell">School</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const currentStatus = 
                    statusUpdates[student.uid]?.[selectedHomework.id] || 
                    student.homeworkStatus?.[selectedHomework.id] || 
                    "missing";
                  
                  return (
                    <tr key={student.uid} className="border-b">
                      <td className="border p-2">{student.studentId}</td>
                      <td className="border p-2">{student.name}</td>
                      <td className="border p-2 hidden sm:table-cell">{student.school}</td>
                      <td className="border p-2 text-center">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(student.uid, e.target.value)}
                          className={`p-1 rounded text-sm md:text-base ${
                            currentStatus === "done" ? "bg-green-100" :
                            currentStatus === "incomplete" ? "bg-yellow-100" :
                            "bg-red-100"
                          }`}
                        >
                          <option value="done">Done</option>
                          <option value="incomplete">Incomplete</option>
                          <option value="missing">Missing</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
              <button
                onClick={saveStatusUpdates}
                className={`p-2 rounded text-white flex-1 ${
                  Object.keys(statusUpdates).length === 0 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={Object.keys(statusUpdates).length === 0}
              >
                Save Changes
              </button>
              
              <button
                onClick={generatePDFReport}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export PDF
              </button>
            </div>
          )}

          {filteredStudents.length === 0 && (
            <p className="text-center text-gray-500 py-4">No students found matching your criteria</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminHomeworkTracking;