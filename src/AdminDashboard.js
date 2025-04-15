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
  const [studentsCount, setStudentsCount] = useState({});
  const [homeworks, setHomeworks] = useState({});
  const [registrationRequests, setRegistrationRequests] = useState([]);

  // Colors for the progress pie chart
  const COLORS = ["#3B82F6", "#E5E7EB"];

  // Fetch data from Firebase
  useEffect(() => {
    // Fetch all courses and their data
    const coursesRef = ref(db, "courses");
    onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        setCourses(coursesData);

        // Fetch homeworks for each course (only due assignments)
        const homeworksData = {};
        const now = new Date();
        
        Object.entries(coursesData).forEach(([course, data]) => {
          if (data.homeworks) {
            const dueHomeworks = Object.values(data.homeworks).filter(hw => {
              if (!hw.dueDate) return false;
              const dueDate = new Date(hw.dueDate);
              return dueDate >= now;
            });
            homeworksData[course] = dueHomeworks;
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
        const studentsCountData = {};
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

    // Fetch registration requests
    const registrationRef = ref(db, "registrationRequests");
    onValue(registrationRef, (snapshot) => {
      if (snapshot.exists()) {
        const requests = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data
        }));
        setRegistrationRequests(requests);
      } else {
        setRegistrationRequests([]);
      }
    });
  }, []);

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
              .sort(([, a], [, b]) => a.index - b.index)
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
                          <span className="text-gray-600">{new Date(hw.dueDate).toLocaleDateString()}</span>
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

        {/* Box 3: Registration Requests */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Registration Requests</h3>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {registrationRequests.length}
            </div>
            <p className="text-gray-600">Pending registrations</p>
            <div className="mt-4 w-full">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Course</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registrationRequests.slice(0, 3).map((request) => (
                      <tr key={request.id}>
                        <td className="px-4 py-2 text-sm text-gray-700">{request.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{request.course}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            request.status === "Registered" ? "bg-green-100 text-green-800" :
                            request.status === "Contacted" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {request.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {registrationRequests.length > 3 && (
                <p className="text-sm text-gray-500 mt-2">
                  + {registrationRequests.length - 3} more requests
                </p>
              )}
            </div>
          </div>
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