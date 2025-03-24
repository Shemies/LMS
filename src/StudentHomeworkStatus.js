import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { auth, db, ref, onValue, query, orderByChild, equalTo } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuth } from "./AuthContext";

const StudentHomeworkStatus = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [username, setUsername] = useState("Loading...");
  const [userId, setUserId] = useState(null);
  const { enrolledCourse } = useAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const usersRef = ref(db, "users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(user.email));

        const unsubscribeUser = onValue(userQuery, (snapshot) => {
          if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0];
            setUsername(userData.name);
            setUserId(userData.studentId);

            // First get all homeworks for the course
            const homeworksRef = ref(db, `courses/${enrolledCourse}/homeworks`);
            onValue(homeworksRef, (homeworkSnapshot) => {
              if (homeworkSnapshot.exists()) {
                const currentDate = new Date();
                const allHomeworks = Object.entries(homeworkSnapshot.val()).map(
                  ([id, hw]) => {
                    const dueDate = new Date(hw.dueDate);
                    const isDue = currentDate >= dueDate;
                    
                    return {
                      id,
                      ...hw,
                      status: isDue ? "missing" : "not yet",
                      dueDateObj: dueDate
                    };
                  }
                );

                // Then merge with user's homework status
                const formattedHomeworks = allHomeworks.map(hw => {
                  const userStatus = userData.homeworkStatus?.[hw.id];
                  const isDue = currentDate >= hw.dueDateObj;
                  
                  return {
                    ...hw,
                    status: isDue ? (userStatus || "missing") : "not yet",
                    submitted: userStatus === "done"
                  };
                });

                setHomeworks(formattedHomeworks);
              } else {
                setHomeworks([]);
              }
            });
          } else {
            setUsername("Unknown User");
            setUserId(null);
            setHomeworks([]);
          }
        });

        return () => unsubscribeUser();
      } else {
        setUsername("Not Logged In");
        setUserId(null);
        setHomeworks([]);
      }
    });

    return () => unsubscribeAuth();
  }, [enrolledCourse]);

  return (
    <Layout username={username}>
      <h1 className="text-3xl font-bold mb-6 text-black">Homework Status</h1>

      {homeworks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-600 text-white text-xs sm:text-base">
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Homework</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Due Date</th>
                <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {homeworks.map((hw) => {
                const dueDate = new Date(hw.dueDate);
                const isPastDue = new Date() >= dueDate;
                
                return (
                  <tr key={hw.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-2 px-3 sm:py-3 sm:px-6 text-gray-800">{hw.title}</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-6 text-center text-gray-800">
                      {dueDate.toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-6 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                          !isPastDue
                            ? "bg-gray-400 text-white" // Gray for "not yet"
                            : hw.status === "done"
                            ? "bg-green-500 text-white"
                            : hw.status === "incomplete"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {!isPastDue ? "Not Yet" : 
                         hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-400">No homework assignments found.</p>
      )}
    </Layout>
  );
};

export default StudentHomeworkStatus;