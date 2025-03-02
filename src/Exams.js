import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { auth, db, ref, onValue, query, orderByChild, equalTo } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuth } from "./AuthContext"; // Import AuthContext

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [username, setUsername] = useState("Loading...");
  const [userId, setUserId] = useState(null);
  const { enrolledCourse } = useAuth(); // Get enrolledCourse from AuthContext

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

            // Fetch exam grades for the user
            if (userData.examGrades) {
              const formattedExams = Object.entries(userData.examGrades).map(
                ([examId, examDetails]) => ({
                  id: examId,
                  name: examId, // Use examId as the name (or modify as needed)
                  score: examDetails.mark,
                  total: examDetails.totalMark,
                  grade: examDetails.grade,
                  comment: examDetails.comment || "No comment", // Add comment field
                })
              );
              setExams(formattedExams);
            } else {
              setExams([]); // No exam grades found
            }
          } else {
            setUsername("Unknown User");
            setUserId(null);
            setExams([]);
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

  return (
    <Layout username={username}>
      <h1 className="text-3xl font-bold mb-6 text-white">Exams & Grades</h1>

      {exams.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200 text-xs sm:text-base">
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Exam</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Score</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Total</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Grade</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Comment</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-gray-800">{exam.name}</td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-center text-gray-800">{exam.score}</td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-center text-gray-800">{exam.total}</td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-center font-bold">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                        exam.grade === "A"
                          ? "bg-green-500 text-white"
                          : exam.grade === "B"
                          ? "bg-blue-500 text-white"
                          : exam.grade === "C"
                          ? "bg-yellow-500 text-white"
                          : exam.grade === "D"
                          ? "bg-orange-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {exam.grade}
                    </span>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-gray-800">{exam.comment}</td>
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