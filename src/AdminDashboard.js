import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useProgress } from "./progressContext";
import { db, ref, onValue } from "./firebase";

const Dashboard = () => {
  const [username, setUsername] = useState("Loading...");
  const { progress, setProgress } = useProgress(); 
  const [studentsCount, setStudentsCount] = useState(0);
  const [homeworks, setHomeworks] = useState([]);
  const [gradeData, setGradeData] = useState([]);

  useEffect(() => {
    // Fetch student count
    const studentsRef = ref(db, "users");
    onValue(studentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const students = Object.values(snapshot.val()).filter(user => user.student);
        setStudentsCount(students.length);
      }
    });

    // Fetch chapters progress from Firebase
    const chaptersRef = ref(db, "chapters");
    onValue(chaptersRef, (snapshot) => {
      if (snapshot.exists()) {
        const chaptersData = snapshot.val();
        const completedChapters = Object.values(chaptersData).filter(ch => ch.done).length;
        const totalChapters = Object.keys(chaptersData).length;
        const calculatedProgress = Math.round((completedChapters / totalChapters) * 100);
        setProgress(calculatedProgress); 
      }
    });

    // Fetch homeworks
    const homeworksRef = ref(db, "homeworks");
    onValue(homeworksRef, (snapshot) => {
      if (snapshot.exists()) {
        setHomeworks(Object.values(snapshot.val()));
      }
    });

    // Fetch grades from the last exam
    const examsRef = ref(db, "examGrades");
    onValue(examsRef, (snapshot) => {
      if (snapshot.exists()) {
        const examsData = Object.values(snapshot.val());
        const lastExam = examsData[examsData.length - 1];
        if (lastExam?.data) {
          const gradesCount = { A: 0, B: 0, C: 0, D: 0, F: 0 };
          Object.values(lastExam.data).forEach(student => {
            if (gradesCount[student.grade] !== undefined) {
              gradesCount[student.grade] += 1;
            }
          });
          setGradeData(Object.entries(gradesCount).map(([key, value]) => ({ name: key, value })));
        }
      }
    });
  }, [setProgress]);

  const safeProgress = progress || 0;

  const progressData = [
    { name: "Completed", value: safeProgress },
    { name: "Remaining", value: 100 - safeProgress },
  ];
  const COLORS = ["#3B82F6", "#E5E7EB"];
  const GRADE_COLORS = { A: "#4CAF50", B: "#2196F3", C: "#FFEB3B", D: "#FF9800", F: "#F44336" };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Syllabus Completion */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Syllabus Completion</h3>
          <div className="w-full flex justify-center max-w-[300px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  startAngle={90} // Start from the top (North)
                  endAngle={-270}
                  innerRadius="60%"
                  outerRadius="90%"
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-lg font-bold mt-3 text-black">{safeProgress}% Completed</p>
        </div>

        {/* Total Students */}
        <div className="bg-white p-20 shadow-lg rounded-xl border border-gray-200 text-center text-3xl font-bold text-blue-600 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          Total Students
          <div className="text-9xl mt-2">{studentsCount}</div>
        </div>


        {/* Grade Distribution */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Grade Distribution (Last Exam)</h3>
          <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    startAngle={90} // Start from the top (North)
                    endAngle={-270}
                    innerRadius="60%"
                    outerRadius="90%"
                    dataKey="value"
                    labelStyle={{ fontSize: "8px", fontWeight: "bold", fill: "#333" }}
                    >
                    {gradeData.map((entry) => (
                        <Cell key={entry.name} fill={GRADE_COLORS[entry.name]} />
                    ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>

        </div>

        {/* Due Assignments */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Due Assignments</h3>
          <ul className="space-y-2">
            {homeworks.map((hw, index) => (
              <li key={index} className="p-3 bg-gray-100 rounded-lg">
                <span className="font-semibold text-[#1E293B]">{hw.title}</span> - <span className="text-gray-600">{hw.due}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
