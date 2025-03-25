import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ref, onValue } from "firebase/database";
import logo from "./assets/lms-logo.png";

export const generateStudentReport = async (student, db) => {
  return new Promise((resolve) => {
    // First fetch all homeworks from the course
    const homeworksRef = ref(db, `courses/${student.enrolledCourse}/homeworks`);
    onValue(homeworksRef, (homeworkSnapshot) => {
      const doc = new jsPDF();
      const currentDate = new Date();
      
      // Add logo at the top
      doc.addImage(logo, 'PNG', 14, 5, 20, 15);

      // Student Information Header
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text(`Student Report: ${student.name}`, 60, 20);

      // Basic Info Section
      doc.setFontSize(12);
      doc.text(`Student ID: ${student.studentId}`, 14, 30);
      doc.text(`Email: ${student.email || "N/A"}`, 14, 36);
      doc.text(`School: ${student.school || "N/A"}`, 14, 42);
      doc.text(`Course: ${student.enrolledCourse || "N/A"}`, 14, 48);

      // Define common table header style
      const headerStyle = {
        fillColor: [200, 200, 200], // Light gray background
        textColor: [0, 0, 0],       // Black text
        fontStyle: 'bold',
        halign: 'center'
      };

      // Exam Grades Table
      if (student.examGrades) {
        doc.setFontSize(14);
        doc.text("Exam Grades", 14, 65);
        
        const examData = Object.entries(student.examGrades).map(([examName, exam]) => [
          examName,
          exam.grade || "N/A",
          exam.mark || "N/A",
          exam.totalMark || "N/A",
          exam.comment || "No comments"
        ]);

        autoTable(doc, {
          startY: 70,
          head: [['Exam', 'Grade', 'Mark', 'Total', 'Comments']],
          body: examData,
          styles: {
            cellPadding: 3,
            fontSize: 10,
            valign: 'middle'
          },
          headStyles: headerStyle,
          margin: { left: 14, right: 14 },
          tableWidth: 'auto',
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' }
          }
        });
      } else {
        doc.text("No exam grades available", 14, 65);
      }

      // Homework Status Table
      const currentY = doc.lastAutoTable?.finalY || 75;
      doc.setFontSize(14);
      doc.text("Homework Status", 14, currentY + 10);

      // Prepare homework data - only include those with due dates in the past
      let homeworkData = [];
      
      if (homeworkSnapshot.exists()) {
        const allHomeworks = homeworkSnapshot.val();
        const studentHwStatus = student.homeworkStatus || {};

        homeworkData = Object.entries(allHomeworks)
          .filter(([_, hw]) => {
            if (!hw.dueDate) return true; // Include if no due date
            const dueDate = new Date(hw.dueDate);
            return dueDate <= currentDate; // Only include if due date has passed
          })
          .map(([hwId, hw]) => {
            const status = studentHwStatus[hwId] || "missing";
            return [
              hw.title || "Untitled Homework",
              hw.dueDate ? formatDate(hw.dueDate) : "No due date",
              formatStatus(status)
            ];
          });
      }

      autoTable(doc, {
        startY: currentY + 15,
        head: [['Homework Name', 'Due Date', 'Status']],
        body: homeworkData,
        styles: {
          cellPadding: 3,
          fontSize: 10,
          valign: 'middle'
        },
        headStyles: headerStyle, // Using the same header style as exams table
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
        columnStyles: {
          0: { cellWidth: 'auto' }, // Homework name
          1: { cellWidth: 'auto' }, // Due date
          2: { cellWidth: 'auto' }  // Status
        },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.row.index >= 0) { // Status column (skip header)
            const status = data.cell.raw.toLowerCase();
            if (status === 'done') {
              data.cell.styles.fillColor = [220, 255, 220];
            } else if (status === 'incomplete') {
              data.cell.styles.fillColor = [255, 255, 200];
            } else if (status === 'missing') {
              data.cell.styles.fillColor = [255, 220, 220];
            }
          }
        }
      });

      // Finalize and save PDF
      const date = formatDate(currentDate);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Report generated on ${date}`, 14, doc.lastAutoTable.finalY + 15);
      
      doc.save(`Student_Report_${student.name.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
      resolve();
    });
  });
};

// Helper function to format status text
const formatStatus = (status) => {
  switch(status.toLowerCase()) {
    case 'done':
      return 'Done';
    case 'incomplete':
      return 'Incomplete';
    case 'missing':
      return 'Missing';
    default:
      return status;
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) 
    ? dateString 
    : `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
};