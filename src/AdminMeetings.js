import React, { useState, useEffect } from "react";
import { ref, onValue, push, update, remove } from "firebase/database";
import { db } from "./firebase";

const AdminMeetings = () => {
  // State declarations
  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    link: "",
    meetingTime: "",
    description: "",
    isOnlineMeeting: true
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMeetingExpanded, setIsAddMeetingExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch courses from Firebase
  useEffect(() => {
    const coursesRef = ref(db, "courses");
    onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = Object.keys(snapshot.val());
        setCourses(coursesData);
        if (coursesData.length > 0 && !activeCourse) {
          setActiveCourse(coursesData[0]);
        }
      }
    });
  }, []);

  // Fetch meetings for active course from courses/{courseId}/meetings
  useEffect(() => {
    if (!activeCourse) return;
    
    const meetingsRef = ref(db, `courses/${activeCourse}/meetings`);
    onValue(meetingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const meetingsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
          meetingTime: data.meetingTime || "",
          isOnlineMeeting: data.isOnlineMeeting !== false
        }));
        setMeetings(meetingsData);
      } else {
        setMeetings([]);
      }
    });
  }, [activeCourse]);

  // Handle form changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Start editing a meeting
  const startEditing = (meeting) => {
    setEditingId(meeting.id);
    setEditData({
      title: meeting.title,
      link: meeting.link,
      meetingTime: meeting.meetingTime,
      description: meeting.description || "",
      isOnlineMeeting: meeting.isOnlineMeeting !== false
    });
    setIsAddMeetingExpanded(true);
  };

  // Save meeting data
  const saveEdit = () => {
    if (!editingId || !editData.title || !editData.link) {
      alert("Title and Link are required");
      return;
    }

    const meetingData = {
      ...editData,
      updatedAt: new Date().toISOString()
    };

    update(ref(db, `courses/${activeCourse}/meetings/${editingId}`), meetingData)
      .then(() => {
        alert("Meeting updated successfully");
        resetForm();
      })
      .catch(error => alert("Error updating meeting: " + error.message));
  };

  // Add new meeting
  const addNewMeeting = () => {
    if (!editData.title || !editData.link) {
      alert("Title and Link are required");
      return;
    }

    const meetingData = {
      ...editData,
      createdAt: new Date().toISOString()
    };

    push(ref(db, `courses/${activeCourse}/meetings`), meetingData)
      .then(() => {
        alert("Meeting added successfully");
        resetForm();
      })
      .catch(error => alert("Error adding meeting: " + error.message));
  };

  // Delete meeting
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      remove(ref(db, `courses/${activeCourse}/meetings/${id}`))
        .catch(error => alert("Error deleting meeting: " + error.message));
    }
  };

  // Reset form
  const resetForm = () => {
    setEditData({
      title: "",
      link: "",
      meetingTime: "",
      description: "",
      isOnlineMeeting: true
    });
    setEditingId(null);
    setIsAddMeetingExpanded(false);
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
  const sortedMeetings = React.useMemo(() => {
    let sortableMeetings = [...meetings];
    if (sortConfig.key) {
      sortableMeetings.sort((a, b) => {
        // Special handling for dates
        if (sortConfig.key === 'meetingTime') {
          const aValue = a.meetingTime ? new Date(a.meetingTime).getTime() : 0;
          const bValue = b.meetingTime ? new Date(b.meetingTime).getTime() : 0;
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
    return sortableMeetings.filter(meeting => 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.description && meeting.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [meetings, sortConfig, searchQuery]);

  return (
    <div className="p-4 text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Meetings Management</h1>

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
            {course}
          </button>
        ))}
      </div>

      {/* Search and Add Meeting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search meetings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md"
        />
        <button
          onClick={() => setIsAddMeetingExpanded(!isAddMeetingExpanded)}
          className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
        >
          {isAddMeetingExpanded ? "Cancel" : "Add New Meeting"}
        </button>
      </div>

      {/* Add/Edit Meeting Form */}
      {isAddMeetingExpanded && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Meeting" : "Add New Meeting"}
          </h2>
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
              <label className="block text-sm font-medium mb-1">
                {editData.isOnlineMeeting ? "Zoom Link*" : "Recording URL*"}
              </label>
              <input
                type="url"
                name="link"
                value={editData.link}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
                required
                placeholder={editData.isOnlineMeeting ? "https://zoom.us/j/..." : "https://youtube.com/..."}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {editData.isOnlineMeeting ? "Meeting Time*" : "Recording Date"}
              </label>
              <input
                type="datetime-local"
                name="meetingTime"
                value={editData.meetingTime}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
                required={editData.isOnlineMeeting}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOnlineMeeting"
                name="isOnlineMeeting"
                checked={editData.isOnlineMeeting}
                onChange={handleEditChange}
                className="h-5 w-5"
              />
              <label htmlFor="isOnlineMeeting" className="ml-2 text-sm">
                Online Meeting (uncheck for recording)
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-md"
                rows="3"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={editingId ? saveEdit : addNewMeeting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {editingId ? "Update" : "Add"} Meeting
            </button>
          </div>
        </div>
      )}

      {/* Meetings Table */}
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
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("meetingTime")}
                >
                  Date/Time {sortConfig.key === "meetingTime" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMeetings.map(meeting => (
                <tr key={meeting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{meeting.title}</div>
                    {meeting.description && (
                      <div className="text-sm text-gray-500">{meeting.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {meeting.meetingTime ? new Date(meeting.meetingTime).toLocaleString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      meeting.isOnlineMeeting 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {meeting.isOnlineMeeting ? "Live Meeting" : "Recording"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={meeting.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {meeting.isOnlineMeeting ? "Join Meeting" : "Watch Recording"}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => startEditing(meeting)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(meeting.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedMeetings.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No meetings found {searchQuery ? "matching your search" : "for this course"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMeetings;