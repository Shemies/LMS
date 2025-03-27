import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { auth, db, ref, onValue, query, orderByChild, equalTo } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuth } from "./AuthContext";

const HomeworkPage = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [username, setUsername] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const { enrolledCourse } = useAuth();

  const toggleDescription = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const usersRef = ref(db, "users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(user.email));

        const unsubscribeUser = onValue(userQuery, (snapshot) => {
          if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0];
            setUsername(userData.name);

            if (!userData.enrolledCourse) {
              setError("No enrolled course found. Please enroll in a course.");
              setLoading(false);
              return;
            }

            const homeworksRef = ref(db, `courses/${userData.enrolledCourse}/homeworks`);
            onValue(homeworksRef, (homeworkSnapshot) => {
              if (homeworkSnapshot.exists()) {
                const currentDate = new Date();
                let allHomeworks = Object.entries(homeworkSnapshot.val()).map(
                  ([id, hw]) => {
                    const dueDate = new Date(hw.dueDate);
                    const isDue = currentDate >= dueDate;
                    const userStatus = userData.homeworkStatus?.[id];
                    
                    return {
                      id,
                      ...hw,
                      status: !isDue ? "not due yet" : 
                             userStatus === "done" ? "done" :
                             userStatus === "incomplete" ? "incomplete" : "missing",
                      dueDateObj: dueDate
                    };
                  }
                );

                allHomeworks.sort((a, b) => b.dueDateObj - a.dueDateObj);
                setHomeworks(allHomeworks);
              } else {
                setHomeworks([]);
                setError("No homeworks found for the enrolled course.");
              }
              setLoading(false);
            }, (error) => {
              console.error("Error fetching homeworks:", error);
              setError("Failed to fetch homeworks. Please try again later.");
              setLoading(false);
            });
          } else {
            setUsername("Unknown User");
            setHomeworks([]);
            setError("User data not found. Please complete your profile.");
            setLoading(false);
          }
        });

        return () => unsubscribeUser();
      } else {
        setUsername("Not Logged In");
        setHomeworks([]);
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "done": return "bg-green-500";
      case "incomplete": return "bg-yellow-500";
      case "missing": return "bg-red-500";
      case "not due yet": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <Layout username={username}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout username={username}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout username={username}>
      <div className="px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-black">Homework</h1>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md text-sm md:text-base">
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="py-3 px-4 md:px-6 text-left">Assignment</th>
                <th className="py-3 px-4 md:px-6 text-left">Description</th>
                <th className="py-3 px-4 md:px-6 text-center">Due Date</th>
                <th className="py-3 px-4 md:px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {homeworks.map((hw) => (
                <tr key={hw.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 md:px-6 font-medium text-gray-800">{hw.title}</td>
                  <td className="py-3 px-4 md:px-6 text-gray-700">{hw.description}</td>
                  <td className="py-3 px-4 md:px-6 text-center text-gray-800">
                    {hw.dueDateObj.toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 md:px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm text-white ${getStatusColor(hw.status)}`}>
                      {hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {homeworks.map((hw) => (
            <div key={hw.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleDescription(hw.id)}
              >
                <div>
                  <h3 className="font-medium text-gray-800">{hw.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Due: {hw.dueDateObj.toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(hw.status)}`}>
                  {hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                </span>
              </div>
              
              {expandedId === hw.id && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                  <p className="text-gray-700">{hw.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {homeworks.length === 0 && (
          <p className="text-center text-gray-400 py-8">No homework assignments found.</p>
        )}
      </div>
    </Layout>
  );
};

export default HomeworkPage;