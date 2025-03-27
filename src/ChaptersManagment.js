import React, { useEffect, useState } from "react";
import { db, ref } from "./firebase";
import { onValue, update, push, remove } from "firebase/database";

const AdminChapters = () => {
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("AS"); // Default active course
  const [newChapterName, setNewChapterName] = useState("");
  const [editingChapter, setEditingChapter] = useState(null);
  const [editChapterName, setEditChapterName] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  // Fetch courses from Firebase
  useEffect(() => {
    const coursesRef = ref(db, "courses");
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = Object.keys(snapshot.val());
        setCourses(coursesData);
      }
    });

    return () => unsubscribeCourses();
  }, []);

  // Fetch chapters for the active course from Firebase
  useEffect(() => {
    const chaptersRef = ref(db, `courses/${activeCourse}/chapters`);
    const unsubscribeChapters = onValue(chaptersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const chaptersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          completedAt: data[key].completedAt || null
        }));
        setChapters(chaptersArray);
      } else {
        setChapters([]); // Reset chapters if no data exists
      }
    });

    return () => unsubscribeChapters();
  }, [activeCourse]);

  // Toggle completion status with date
  const handleCheckboxChange = async (id, done) => {
    const updates = {
      done: !done,
      completedAt: !done ? new Date().toISOString() : null
    };

    try {
      await update(ref(db, `courses/${activeCourse}/chapters/${id}`), updates);
      setChapters((prevChapters) =>
        prevChapters.map((chapter) =>
          chapter.id === id ? { ...chapter, ...updates } : chapter
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
      const chaptersRef = ref(db, `courses/${activeCourse}/chapters`);
      const newChapterRef = push(chaptersRef);
      await update(newChapterRef, { 
        name: newChapterName, 
        done: false,
        completedAt: null
      });

      setNewChapterName("");
    } catch (error) {
      console.error("Error adding chapter:", error);
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (id) => {
    try {
      await remove(ref(db, `courses/${activeCourse}/chapters/${id}`));
      setChapters((prevChapters) => prevChapters.filter((chapter) => chapter.id !== id));
    } catch (error) {
      console.error("Error deleting chapter:", error);
    }
  };

  // Start editing a chapter
  const startEditing = (chapter) => {
    setEditingChapter(chapter.id);
    setEditChapterName(chapter.name);
    setCompletionDate(chapter.completedAt ? chapter.completedAt.split('T')[0] : "");
  };

  // Save edited chapter
  const saveEdit = async () => {
    if (!editChapterName.trim()) return;

    const updates = {
      name: editChapterName,
      completedAt: completionDate ? new Date(completionDate).toISOString() : null
    };

    try {
      await update(ref(db, `courses/${activeCourse}/chapters/${editingChapter}`), updates);
      setChapters((prevChapters) =>
        prevChapters.map((chapter) =>
          chapter.id === editingChapter ? { ...chapter, ...updates } : chapter
        )
      );
      setEditingChapter(null);
      setEditChapterName("");
      setCompletionDate("");
    } catch (error) {
      console.error("Error updating chapter:", error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingChapter(null);
    setEditChapterName("");
    setCompletionDate("");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Chapters Management</h2>

      {/* Course Tabs */}
      <div className="flex space-x-4 mb-6">
        {courses.map((course) => (
          <button
            key={course}
            className={`p-2 ${activeCourse === course ? "bg-blue-600" : "bg-gray-600"} rounded-md text-white`}
            onClick={() => setActiveCourse(course)}
          >
            {course}
          </button>
        ))}
      </div>

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
            <th className="border px-4 py-2">Completion Date</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => (
            <tr key={chapter.id} className="text-center">
              <td className="border px-4 py-2">
                {editingChapter === chapter.id ? (
                  <input
                    type="text"
                    value={editChapterName}
                    onChange={(e) => setEditChapterName(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  chapter.name
                )}
              </td>
              <td className="border px-4 py-2">
                <input
                  type="checkbox"
                  checked={chapter.done}
                  onChange={() => handleCheckboxChange(chapter.id, chapter.done)}
                  className="w-5 h-5"
                />
              </td>
              <td className="border px-4 py-2">
                {editingChapter === chapter.id ? (
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  chapter.completedAt ? new Date(chapter.completedAt).toLocaleDateString() : "-"
                )}
              </td>
              <td className="border px-4 py-2 space-x-2">
                {editingChapter === chapter.id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(chapter)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminChapters;