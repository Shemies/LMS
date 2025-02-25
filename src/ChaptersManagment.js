import React, { useEffect, useState } from "react";
import { db, ref } from "./firebase";
import { onValue, update, push, remove } from "firebase/database";

const AdminChapters = () => {
  const [chapters, setChapters] = useState([]);
  const [newChapterName, setNewChapterName] = useState("");

  // Fetch chapters from Firebase
  useEffect(() => {
    const chaptersRef = ref(db, "chapters");

    const unsubscribe = onValue(chaptersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const chaptersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setChapters(chaptersArray);
      }
    });

    return () => unsubscribe();
  }, []);

  // Toggle completion status
  const handleCheckboxChange = async (id, done) => {
    try {
      await update(ref(db, `chapters/${id}`), { done: !done });
      setChapters((prevChapters) =>
        prevChapters.map((chapter) =>
          chapter.id === id ? { ...chapter, done: !done } : chapter
        )
      );
    } catch (error) {
      console.error("Error updating chapter:", error);
    }
  };

  // Add new chapter
  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return;

    try {
      const chaptersRef = ref(db, "chapters");
      const newChapterRef = push(chaptersRef);
      await update(newChapterRef, { name: newChapterName, done: false });

      setNewChapterName("");
    } catch (error) {
      console.error("Error adding chapter:", error);
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (id) => {
    try {
      await remove(ref(db, `chapters/${id}`));
      setChapters((prevChapters) => prevChapters.filter((chapter) => chapter.id !== id));
    } catch (error) {
      console.error("Error deleting chapter:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Chapters</h2>

      {/* Add Chapter */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="New chapter name"
          value={newChapterName}
          onChange={(e) => setNewChapterName(e.target.value)}
          className="border px-3 py-2 rounded w-1/3 text-black"
        />
        <button
          onClick={handleAddChapter}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Chapter
        </button>
      </div>

      {/* Chapters Table */}
      <table className="min-w-full bg-white border border-gray-300 shadow-md text-black">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Chapter Name</th>
            <th className="border px-4 py-2">Completed</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => (
            <tr key={chapter.id} className="text-center">
              <td className="border px-4 py-2">{chapter.name}</td>
              <td className="border px-4 py-2">
                <input
                  type="checkbox"
                  checked={chapter.done}
                  onChange={() => handleCheckboxChange(chapter.id, chapter.done)}
                  className="w-5 h-5"
                />
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDeleteChapter(chapter.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminChapters;
