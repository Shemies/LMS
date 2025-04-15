import React, { useEffect, useState } from "react";
import { db, ref } from "./firebase";
import { onValue, update, push, remove } from "firebase/database";

const AdminChapters = () => {
  // State declarations
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("AS");
  const [newChapterName, setNewChapterName] = useState("");
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    done: false,
    completedAt: ""
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch courses from Firebase
  useEffect(() => {
    const coursesRef = ref(db, "courses");
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        setCourses(Object.keys(snapshot.val()));
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
        setChapters([]);
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
    } catch (error) {
      console.error("Error updating chapter:", error);
    }
  };

  // Add new chapter
  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return;

    try {
      const chaptersRef = ref(db, `courses/${activeCourse}/chapters`);
      await push(chaptersRef, { 
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
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      try {
        await remove(ref(db, `courses/${activeCourse}/chapters/${id}`));
      } catch (error) {
        console.error("Error deleting chapter:", error);
      }
    }
  };

  // Start editing a chapter
  const startEditing = (chapter) => {
    setEditingChapterId(chapter.id);
    setEditData({
      name: chapter.name,
      done: chapter.done,
      completedAt: chapter.completedAt ? chapter.completedAt.split('T')[0] : ""
    });
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited chapter
  const saveEdit = async () => {
    if (!editData.name.trim()) return;

    const updates = {
      name: editData.name,
      done: editData.done,
      completedAt: editData.completedAt ? new Date(editData.completedAt).toISOString() : null
    };

    try {
      await update(ref(db, `courses/${activeCourse}/chapters/${editingChapterId}`), updates);
      setEditingChapterId(null);
    } catch (error) {
      console.error("Error updating chapter:", error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingChapterId(null);
    setEditData({
      name: "",
      done: false,
      completedAt: ""
    });
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sorting and filtering
  const sortedChapters = React.useMemo(() => {
    let sortableChapters = [...chapters];
    if (sortConfig.key) {
      sortableChapters.sort((a, b) => {
        // Special handling for dates
        if (sortConfig.key === 'completedAt') {
          const aValue = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const bValue = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Default sorting for other fields
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (sortConfig.direction === "asc") {
          return aValue.toString().localeCompare(bValue.toString());
        } else {
          return bValue.toString().localeCompare(aValue.toString());
        }
      });
    }
    return sortableChapters.filter(chapter => 
      chapter.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chapters, sortConfig, searchQuery]);

  return (
    <div className="p-4 text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Chapters Management</h1>

      {/* Course Tabs */}
      <div className="flex space-x-2 mb-6 p-2">
        {courses.map(course => (
          <button
            key={course}
            onClick={() => setActiveCourse(course)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeCourse === course 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {course} Course
          </button>
        ))}
      </div>

      {/* Search and Add Chapter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New chapter name"
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={handleAddChapter}
            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 whitespace-nowrap"
          >
            Add Chapter
          </button>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-300 text-black">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Chapter Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("done")}
                >
                  Status {sortConfig.key === "done" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("completedAt")}
                >
                  Completion Date {sortConfig.key === "completedAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedChapters.map(chapter => (
                <tr key={chapter.id} className="hover:bg-gray-50">
                  {editingChapterId === chapter.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          className="p-1 border rounded w-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          name="done"
                          checked={editData.done}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            done: e.target.checked
                          }))}
                          className="w-5 h-5"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          name="completedAt"
                          value={editData.completedAt}
                          onChange={handleEditChange}
                          className="p-1 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {chapter.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={chapter.done}
                          onChange={() => handleCheckboxChange(chapter.id, chapter.done)}
                          className="w-5 h-5"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {chapter.completedAt ? new Date(chapter.completedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => startEditing(chapter)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedChapters.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No chapters found {searchQuery ? "matching your search" : "for this course"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChapters;