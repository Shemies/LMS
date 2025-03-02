import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { db, ref, onValue } from "./firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper"; // Import SwiperCore
import { Navigation, Pagination } from "swiper/modules"; // Correct import path
import "swiper/swiper-bundle.css"; // Import Swiper styles

// Initialize Swiper modules
SwiperCore.use([Navigation, Pagination]);

const Dashboard = () => {
  const [courses, setCourses] = useState({});
  const [studentsCount, setStudentsCount] = useState(0);
  const [homeworks, setHomeworks] = useState([]);
  const [gradeData, setGradeData] = useState({ AS: [], OL: [] });

  // Fetch data from Firebase
  useEffect(() => {
    // Fetch all courses and their data
    const coursesRef = ref(db, "courses");
    onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        setCourses(coursesData);

        // Calculate progress and grade distribution for each course
        const gradeData = { AS: [], OL: [] };
        Object.entries(coursesData).forEach(([course, data]) => {
          // Calculate syllabus completion
          const chapters = data.chapters || {};
          const completedChapters = Object.values(chapters).filter((ch) => ch.done).length;
          const totalChapters = Object.keys(chapters).length;
          const progress = Math.round((completedChapters / totalChapters) * 100);

          // Calculate grade distribution
          const gradesCount = { A: 0, B: 0, C: 0, D: 0, F: 0 };
          const usersRef = ref(db, "users");
          onValue(usersRef, (usersSnapshot) => {
            if (usersSnapshot.exists()) {
              const users = Object.values(usersSnapshot.val()).filter((user) => user.enrolledCourse === course);
              users.forEach((user) => {
                if (user.examGrades) {
                  const lastExam = Object.values(user.examGrades)[0]; // Get the latest exam
                  if (lastExam && gradesCount[lastExam.grade] !== undefined) {
                    gradesCount[lastExam.grade] += 1;
                  }
                }
              });
              gradeData[course] = Object.entries(gradesCount).map(([key, value]) => ({ name: key, value }));
            }
          });

          // Update state
          setGradeData(gradeData);
        });
      }
    });

    // Fetch student count
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const students = Object.values(snapshot.val()).filter((user) => user.student);
        setStudentsCount(students.length);
      }
    });

    // Fetch homeworks
    const homeworksRef = ref(db, "courses");
    onValue(homeworksRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        const allHomeworks = [];
        Object.values(coursesData).forEach((course) => {
          if (course.homeworks) {
            allHomeworks.push(...Object.values(course.homeworks));
          }
        });
        setHomeworks(allHomeworks);
      }
    });
  }, []);

  // Colors for the progress pie chart
  const COLORS = ["#3B82F6", "#E5E7EB"];

  // Colors for the grade distribution pie chart
  const GRADE_COLORS = { A: "#4CAF50", B: "#2196F3", C: "#FFEB3B", D: "#FF9800", F: "#F44336" };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Grid Layout for Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Syllabus Completion Carousel */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Syllabus Completion</h3>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
          >
            {Object.entries(courses).map(([course, data]) => {
              const chapters = data.chapters || {};
              const completedChapters = Object.values(chapters).filter((ch) => ch.done).length;
              const totalChapters = Object.keys(chapters).length;
              const progress = Math.round((completedChapters / totalChapters) * 100);

              const progressData = [
                { name: "Completed", value: progress },
                { name: "Remaining", value: 100 - progress },
              ];

              return (
                <SwiperSlide key={course}>
                  <div className="flex flex-col items-center">
                    <h4 className="text-md font-semibold mb-2 text-[#0F172A]">{course} Syllabus</h4>
                    <div className="w-full flex justify-center max-w-[300px]">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={progressData}
                            cx="50%"
                            cy="50%"
                            startAngle={90}
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
                    <p className="text-center text-lg font-bold mt-3 text-black">{progress}% Completed</p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Total Students */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Total Students</h3>
          <div className="text-6xl font-bold text-blue-600">{studentsCount}</div>
        </div>

        {/* Grade Distribution Carousel */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Grade Distribution (Last Exam)</h3>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
          >
            {Object.entries(gradeData).map(([course, data]) => (
              <SwiperSlide key={course}>
                <div className="flex flex-col items-center">
                  <h4 className="text-md font-semibold mb-2 text-[#0F172A]">{course} Grades</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius="60%"
                        outerRadius="90%"
                        dataKey="value"
                        labelStyle={{ fontSize: "8px", fontWeight: "bold", fill: "#333" }}
                      >
                        {data.map((entry) => (
                          <Cell key={entry.name} fill={GRADE_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Due Assignments */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Due Assignments</h3>
          <ul className="space-y-2">
            {homeworks.length > 0 ? (
              homeworks.map((hw, index) => (
                <li key={index} className="p-3 bg-gray-100 rounded-lg">
                  <span className="font-semibold text-[#1E293B]">{hw.title}</span> -{" "}
                  <span className="text-gray-600">{hw.dueDate}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No assignments due.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;