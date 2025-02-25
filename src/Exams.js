import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { auth, db, ref, onValue, query, orderByChild, equalTo } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [username, setUsername] = useState("Loading...");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const usersRef = ref(db, "users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(user.email));

        const unsubscribeUser = onValue(userQuery, (snapshot) => {
          if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0];
            setUsername(userData.name);
            setUserId(userData.studentId); // Correctly fetching studentId
          } else {
            setUsername("Unknown User");
            setUserId(null);
          }
        });

        return () => unsubscribeUser(); // Cleanup user listener
      } else {
        setUsername("Not Logged In");
        setUserId(null);
        setExams([]);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  useEffect(() => {
    if (!userId) return;

    const examsRef = ref(db, "examGrades");
    const unsubscribeExams = onValue(examsRef, (snapshot) => {
      if (snapshot.exists()) {
        const examsData = snapshot.val();
        let studentExams = [];

        Object.entries(examsData).forEach(([examId, examDetails]) => {
          if (examDetails.data) {
            Object.values(examDetails.data).forEach((student) => {
              if (student.studentId === userId) { // Correctly checking student ID
                studentExams.push({
                  id: examId,
                  name: examDetails.name,
                  score: student.mark,
                  total: student.totalMark,
                  grade: student.grade,
                });
              }
            });
          }
        });

        setExams(studentExams);
      } else {
        setExams([]);
      }
    });

    return () => unsubscribeExams(); // Cleanup exams listener
  }, [userId]);

  return (
    <Layout username={username}>
      <h1 className="text-3xl font-bold mb-6 text-white">Exams & Grades</h1>

      {exams.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-[90%] max-w-md mx-auto bg-gray-800 text-white rounded-lg shadow-md text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-700 text-xs sm:text-base">
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Exam</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Score</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Total</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-b border-gray-600 hover:bg-gray-750">
                  <td className="py-2 px-3 sm:py-3 sm:px-6">{exam.name}</td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-center">{exam.score}</td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-center">{exam.total}</td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-center font-bold">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                        exam.grade === "A"
                          ? "bg-green-500"
                          : exam.grade === "B"
                          ? "bg-blue-500"
                          : exam.grade === "C"
                          ? "bg-yellow-500"
                          : exam.grade === "D"
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                    >
                      {exam.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-400">No exam records found.</p>
      )}
    </Layout>
  );
};

export default Exams;
