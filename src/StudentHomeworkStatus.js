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
      <div className="px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-black">Homework Status</h1>

        {homeworks.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Mobile Cards View */}
            <div className="sm:hidden space-y-4">
              {homeworks.map((hw) => {
                const dueDate = new Date(hw.dueDate);
                const isPastDue = new Date() >= dueDate;
                const statusText = !isPastDue ? "Not Yet" : 
                                 hw.status.charAt(0).toUpperCase() + hw.status.slice(1);
                const statusColor = !isPastDue ? "bg-gray-400" :
                                  hw.status === "done" ? "bg-green-500" :
                                  hw.status === "incomplete" ? "bg-yellow-500" : "bg-red-500";

                return (
                  <div key={hw.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">{hw.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColor} text-white`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Due: {dueDate.toLocaleDateString()}</p>
                      {hw.description && (
                        <p className="mt-2 text-gray-700">{hw.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <table className="hidden sm:table w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md text-sm md:text-base">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="py-3 px-4 md:px-6 text-left">Homework</th>
                  <th className="py-3 px-4 md:px-6 text-center">Due Date</th>
                  <th className="py-3 px-4 md:px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {homeworks.map((hw) => {
                  const dueDate = new Date(hw.dueDate);
                  const isPastDue = new Date() >= dueDate;
                  
                  return (
                    <tr key={hw.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 md:px-6 text-gray-800">
                        <div className="font-medium">{hw.title}</div>
                        {hw.description && (
                          <div className="text-xs text-gray-500 mt-1">{hw.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 md:px-6 text-center text-gray-800">
                        {dueDate.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 md:px-6 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm ${!isPastDue
                            ? "bg-gray-400 text-white"
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
      </div>
    </Layout>
  );
};

export default StudentHomeworkStatus;