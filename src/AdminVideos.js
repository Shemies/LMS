import React, { useState, useEffect } from "react";
import { ref, onValue, remove, push, update } from "firebase/database";
import { db } from "./firebase";

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("OL");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ 
    title: "", 
    url: "", 
    published: true 
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddVideoExpanded, setIsAddVideoExpanded] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: "asc" 
  });

  // Fetch courses from Firebase
  useEffect(() => {
    const coursesRef = ref(db, "courses");
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = Object.keys(snapshot.val());
        setCourses(coursesData);
        if (!activeCourse && coursesData.length > 0) {
          setActiveCourse(coursesData[0]);
        }
      }
    });

    return () => unsubscribeCourses();
  }, [activeCourse]); // Added activeCourse to dependency array

  // Fetch videos for the active course from Firebase
  useEffect(() => {
    if (!activeCourse) return;
    
    const videosRef = ref(db, `courses/${activeCourse}/videos`);
    const unsubscribeVideos = onValue(videosRef, (snapshot) => {
      if (snapshot.exists()) {
        const videosData = Object.entries(snapshot.val()).map(([id, data]) => ({ 
          id, 
          ...data,
          published: data.published !== false // Default to true if not set
        }));
        setVideos(videosData);
      } else {
        setVideos([]);
      }
    });

    return () => unsubscribeVideos();
  }, [activeCourse]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const startEditing = (video) => {
    setEditingId(video.id);
    setEditData({ 
      title: video.title, 
      url: video.url,
      published: video.published !== false
    });
    setExpandedVideoId(null);
  };

  const saveEdit = () => {
    if (!editingId || !editData.title || !editData.url) {
      alert("Title and URL are required");
      return;
    }

    update(ref(db, `courses/${activeCourse}/videos/${editingId}`), editData)
      .then(() => {
        alert("Video updated successfully");
        setEditingId(null);
      })
      .catch(error => alert("Error updating video: " + error.message));
  };

  const addNewVideo = () => {
    if (!editData.title || !editData.url) {
      alert("Title and URL are required");
      return;
    }

    push(ref(db, `courses/${activeCourse}/videos`), {
      ...editData,
      published: editData.published !== false
    })
      .then(() => {
        alert("Video added successfully");
        setIsAddVideoExpanded(false);
        setEditData({ title: "", url: "", published: true });
      })
      .catch(error => alert("Error adding video: " + error.message));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      remove(ref(db, `courses/${activeCourse}/videos/${id}`))
        .catch(error => alert("Error deleting video: " + error.message));
    }
  };

  const toggleVideoPreview = (id) => {
    setExpandedVideoId(expandedVideoId === id ? null : id);
  };

  const togglePublishStatus = async (id, currentStatus) => {
    try {
      await update(ref(db, `courses/${activeCourse}/videos/${id}`), {
        published: !currentStatus
      });
    } catch (error) {
      alert("Error updating publish status: " + error.message);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedVideos = React.useMemo(() => {
    let sortableVideos = [...videos];
    if (sortConfig.key) {
      sortableVideos.sort((a, b) => {
        // Special handling for boolean fields
        if (sortConfig.key === 'published') {
          const aValue = a.published ? 1 : 0;
          const bValue = b.published ? 1 : 0;
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
    return sortableVideos;
  }, [videos, sortConfig]);

  const filteredVideos = sortedVideos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Videos Management</h1>

      {/* Course Tabs */}
      <div className="flex space-x-2 mb-6 p-2">
        {courses.map(course => (
          <button
            key={course}
            onClick={() => {
              setActiveCourse(course);
              setExpandedVideoId(null);
            }}
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

      {/* Search and Add Video */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md"
        />
        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={() => setIsAddVideoExpanded(!isAddVideoExpanded)}
            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
          >
            {isAddVideoExpanded ? "Cancel" : "Add New Video"}
          </button>
        </div>
      </div>

      {/* Add Video Form */}
      {isAddVideoExpanded && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Video</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title*</label>
              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">YouTube URL*</label>
              <input
                type="url"
                name="url"
                value={editData.url}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
                required
                placeholder="https://youtube.com/embed/..."
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="publish-new"
                name="published"
                checked={editData.published}
                onChange={handleEditChange}
                className="h-5 w-5"
              />
              <label htmlFor="publish-new" className="ml-2 text-sm">
                Publish (visible to students)
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setIsAddVideoExpanded(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={addNewVideo}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Video
            </button>
          </div>
        </div>
      )}

      {/* Videos Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-300 text-black">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  Title {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  URL
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("published")}
                >
                  Status {sortConfig.key === "published" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVideos.map(video => (
                <React.Fragment key={video.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleVideoPreview(video.id)}>
                    {editingId === video.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="title"
                            value={editData.title}
                            onChange={handleEditChange}
                            className="p-1 border rounded w-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="url"
                            name="url"
                            value={editData.url}
                            onChange={handleEditChange}
                            className="p-1 border rounded w-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            name="published"
                            checked={editData.published}
                            onChange={handleEditChange}
                            className="h-5 w-5"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {video.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                          <a 
                            href={video.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {video.url}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={video.published !== false}
                            onChange={(e) => {
                              e.stopPropagation();
                              togglePublishStatus(video.id, video.published !== false);
                            }}
                            className="h-5 w-5"
                          />
                          <span className="ml-2">
                            {video.published !== false ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditing(video); }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleVideoPreview(video.id); }}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                          >
                            {expandedVideoId === video.id ? "Hide" : "Preview"}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                  {expandedVideoId === video.id && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 bg-gray-50">
                        <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto">
                          <iframe
                            src={video.url}
                            title={video.title}
                            className="w-full h-96"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filteredVideos.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No videos found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideos;