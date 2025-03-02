import React, { useEffect, useState } from "react";
import { db, ref, push, onValue, remove } from "./firebase";

const AdminHomeworks = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("AS"); // Default selected course

  // Fetch homeworks from Firebase based on the selected course
  useEffect(() => {
    const homeworksRef = ref(db, `courses/${selectedCourse}/homeworks`);

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
  }, [selectedCourse]);

  // Add new homework
  const handleAddHomework = () => {
    if (title && description && dueDate) {
      const homeworksRef = ref(db, `courses/${selectedCourse}/homeworks`);
      push(homeworksRef, { title, description, dueDate });

      // Clear input fields
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  };

  // Delete a homework
  const handleDeleteHomework = (id) => {
    const homeworkRef = ref(db, `courses/${selectedCourse}/homeworks/${id}`);
    remove(homeworkRef);
  };

  // Function to check if a due date is past today
  const isPastDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Homeworks</h1>

      {/* Course Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelectedCourse("AS")}
          className={`px-4 py-2 rounded-lg ${
            selectedCourse === "AS"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          AS Course
        </button>
        <button
          onClick={() => setSelectedCourse("OL")}
          className={`px-4 py-2 rounded-lg ${
            selectedCourse === "OL"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          OL Course
        </button>
      </div>

      {/* Form to Add Homework */}
      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[80%] mx-auto mb-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Add New Homework</h3>
        <input
          type="text"
          placeholder="Homework Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <button
          onClick={handleAddHomework}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Homework
        </button>
      </div>

      {/* Display Existing Homeworks */}
      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[80%] mx-auto">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Existing Homeworks</h3>

        {homeworks.length > 0 ? (
          homeworks.map((hw) => (
            <div key={hw.id} className="p-5 rounded-lg border bg-gray-800 text-white mb-4">
              <h2 className="text-xl font-semibold">{hw.title}</h2>
              <p className="text-gray-300">{hw.description}</p>
              <p className="mt-2 font-medium">
                Due Date:{" "}
                <span
                  className={`${
                    isPastDue(hw.dueDate) ? "text-red-500" : "text-yellow-400"
                  }`}
                >
                  {hw.dueDate}
                </span>
              </p>
              <button
                onClick={() => handleDeleteHomework(hw.id)}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No homeworks available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminHomeworks;