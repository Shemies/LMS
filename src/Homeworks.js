import React, { useEffect, useState } from "react";
import { db, ref, onValue } from "./firebase";
import Layout from "./Layout";

const Homeworks = () => {
  const [homeworks, setHomeworks] = useState([]);

  // Fetch homeworks from Firebase
  useEffect(() => {
    const homeworksRef = ref(db, "homeworks");

    onValue(homeworksRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedHomeworks = Object.entries(data).map(([id, hw]) => ({
          id,
          ...hw,
        }));
        setHomeworks(formattedHomeworks);
      } else {
        setHomeworks([]);
      }
    });
  }, []);

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  return (
    <Layout username="Shemies">
      <h1 className="text-3xl font-bold mb-6 text-white">Homeworks</h1>

      <div className="space-y-4">
        {homeworks.length > 0 ? (
          homeworks.map((hw) => (
            <div
              key={hw.id}
              className={`p-5 rounded-lg border ${
                hw.dueDate < today ? "bg-red-900 text-white" : "bg-gray-800 text-white"
              }`}
            >
              <h2 className="text-xl font-semibold">{hw.title}</h2>
              <p className="text-gray-300">{hw.description}</p>
              <p className="mt-2 font-medium">
                Due Date: <span className="text-yellow-400">{hw.dueDate}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No homeworks available.</p>
        )}
      </div>
    </Layout>
  );
};

export default Homeworks;
