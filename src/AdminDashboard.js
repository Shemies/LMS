import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { db, ref, onValue } from "./firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

// Initialize Swiper modules
SwiperCore.use([Navigation, Pagination]);

const Dashboard = () => {
  const [courses, setCourses] = useState({});
  const [studentsCount, setStudentsCount] = useState({}); // Students count per course
  const [homeworks, setHomeworks] = useState({}); // Homeworks per course
  const [gradeData, setGradeData] = useState({});

  // Fetch data from Firebase
  useEffect(() => {
    // Fetch all courses and their data
    const coursesRef = ref(db, "courses");
    onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        setCourses(coursesData);

        // Calculate progress and grade distribution for each course
        const gradeData = {};
        const homeworksData = {}; // Homeworks grouped by course

        // Sort courses by their index
        const sortedCourses = Object.entries(coursesData).sort(
          ([, a], [, b]) => a.index - b.index
        );

        // Fetch users data to determine the latest exam
        const usersRef = ref(db, "users");
        onValue(usersRef, (usersSnapshot) => {
          if (usersSnapshot.exists()) {
            const users = Object.values(usersSnapshot.val()).filter((user) => user.student);

            // Determine the latest exam across all users
            let latestExamKey = "";
            users.forEach((user) => {
              if (user.examGrades) {
                const examKeys = Object.keys(user.examGrades);
                examKeys.forEach((key) => {
                  if (key > latestExamKey) {
                    latestExamKey = key; // Update the latest exam key
                  }
                });
              }
            });

            // Calculate grade distribution for each course using the latest exam
            sortedCourses.forEach(([course, data]) => {
              const gradesCount = { Star: 0, A: 0, B: 0, C: 0, D: 0, E: 0, U: 0 };
              const courseUsers = users.filter((user) => user.enrolledCourse === course);

              courseUsers.forEach((user) => {
                if (user.examGrades && user.examGrades[latestExamKey]) {
                  const grade = user.examGrades[latestExamKey].grade;
                  if (gradesCount[grade] !== undefined) {
                    gradesCount[grade] += 1;
                  }
                }
              });

              gradeData[course] = Object.entries(gradesCount).map(([key, value]) => ({
                name: key,
                value,
              }));
            });

            // Update state
            setGradeData(gradeData);
          }
        });

        // Fetch homeworks for each course
        sortedCourses.forEach(([course, data]) => {
          if (data.homeworks) {
            homeworksData[course] = Object.values(data.homeworks);
          }
        });

        setHomeworks(homeworksData);
      }
    });

    // Fetch student count per course
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = Object.values(snapshot.val()).filter((user) => user.student);
        const studentsCountData = {}; // Students count grouped by course
        users.forEach((user) => {
          const course = user.enrolledCourse;
          if (course) {
            if (!studentsCountData[course]) {
              studentsCountData[course] = 0;
            }
            studentsCountData[course] += 1;
          }
        });
        setStudentsCount(studentsCountData);
      }
    });
  }, []);

  // Colors for the progress pie chart
  const COLORS = ["#3B82F6", "#E5E7EB"];

  // Colors for the grade distribution pie chart
  const GRADE_COLORS = {
    Star: "#00A36C",
    A: "#90EE90",
    B: "#2196F3",
    C: "#FFEB3B",
    D: "#F88379",
    E: "#FF0000",
    U: "#D2042D",
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Grid Layout for Dashboard Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Syllabus Completion for All Courses */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Syllabus Completion</h3>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, el: ".custom-pagination-syllabus" }}
          >
            {Object.entries(courses)
              .sort(([, a], [, b]) => a.index - b.index) // Sort courses by index
              .map(([course, data]) => (
                <SwiperSlide key={course}>
                  <div className="flex flex-col items-center">
                    <h4 className="text-md font-semibold mb-2 text-[#0F172A]">{course}</h4>
                    <div className="w-full flex justify-center">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Completed",
                                value: Math.round(
                                  (Object.values(data.chapters || {}).filter((ch) => ch.done).length /
                                    Object.keys(data.chapters || {}).length) *
                                    100
                                ),
                              },
                              {
                                name: "Remaining",
                                value:
                                  100 -
                                  Math.round(
                                    (Object.values(data.chapters || {}).filter((ch) => ch.done).length /
                                      Object.keys(data.chapters || {}).length) *
                                      100
                                  ),
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            startAngle={90}
                            endAngle={-270}
                            innerRadius="60%"
                            outerRadius="90%"
                            dataKey="value"
                          >
                            {[0, 1].map((index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-center text-lg font-bold mt-3 text-black">
                      {Math.round(
                        (Object.values(data.chapters || {}).filter((ch) => ch.done).length /
                          Object.keys(data.chapters || {}).length) *
                          100
                      )}
                      % Completed
                    </p>
                  </div>
                </SwiperSlide>
              ))}
          </Swiper>
          <div className="custom-pagination-syllabus mt-4 flex justify-center space-x-2"></div>
        </div>

        {/* Box 2: Due Assignments for All Courses */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Due Assignments</h3>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, el: ".custom-pagination-assignments" }}
          >
            {Object.entries(homeworks).map(([course, assignments]) => (
              <SwiperSlide key={course}>
                <div className="flex flex-col p-4 items-center">
                  <h4 className="text-xl font-semibold mb-2 text-[#0F172A]">{course}</h4>
                  <ul className="space-y-2 w-full p-8">
                    {assignments.length > 0 ? (
                      assignments.map((hw, index) => (
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
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="custom-pagination-assignments mt-4 flex justify-center space-x-2"></div>
        </div>

        {/* Box 3: Grade Distribution for All Courses */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Grade Distribution</h3>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, el: ".custom-pagination-grades" }}
          >
            {Object.entries(gradeData).map(([course, grades]) => (
              <SwiperSlide key={course}>
                <div className="flex flex-col items-center">
                  <h4 className="text-md font-semibold mb-2 text-[#0F172A]">{course}</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={grades}
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius="60%"
                        outerRadius="90%"
                        dataKey="value"
                      >
                        {grades.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="custom-pagination-grades mt-4 flex justify-center space-x-2"></div>
        </div>

        {/* Box 4: Total Students for All Courses */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Total Students</h3>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, el: ".custom-pagination-students" }}
          >
            {Object.entries(studentsCount).map(([course, count]) => (
              <SwiperSlide key={course}>
                <div className="flex flex-col p-9 items-center">
                  <h4 className="text-3xl font-semibold mb-2 text-[#0F172A]">{course}</h4>
                  <div className="text-6xl font-bold p-9 text-blue-600">{count}</div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="custom-pagination-students mt-4 flex justify-center space-x-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;