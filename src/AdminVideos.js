import React, { useState, useEffect } from "react";
import { db, ref, onValue, set, remove, push } from "./firebase";

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("AS"); // Default active course
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState(null);

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

  // Fetch videos for the active course from Firebase
  useEffect(() => {
    const videosRef = ref(db, `courses/${activeCourse}/videos`);
    const unsubscribeVideos = onValue(videosRef, (snapshot) => {
      if (snapshot.exists()) {
        const videoData = snapshot.val();
        const videoList = Object.keys(videoData).map((key) => ({
          id: key,
          ...videoData[key],
        }));
        setVideos(videoList);
      } else {
        setVideos([]); // Reset videos if no data exists
      }
    });

    return () => unsubscribeVideos();
  }, [activeCourse]);

  // Add or Update Video
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !url) return alert("Please enter a title and URL!");

    if (editingId) {
      // Update existing video
      set(ref(db, `courses/${activeCourse}/videos/${editingId}`), { title, url });
      setEditingId(null);
    } else {
      // Add new video
      const newVideoRef = push(ref(db, `courses/${activeCourse}/videos`));
      set(newVideoRef, { title, url });
    }

    // Reset form
    setTitle("");
    setUrl("");
  };

  // Edit Video
  const handleEdit = (video) => {
    setTitle(video.title);
    setUrl(video.url);
    setEditingId(video.id);
  };

  // Delete Video
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      remove(ref(db, `courses/${activeCourse}/videos/${id}`));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Manage Videos</h1>

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

      {/* Video Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[#0F172A]">
          {editingId ? "Edit Video" : "Add New Video"}
        </h2>
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-black p-2 border rounded mb-3"
        />
        <input
          type="text"
          placeholder="YouTube Embed URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full text-black p-2 border rounded mb-3"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingId ? "Update Video" : "Add Video"}
        </button>
      </form>

      {/* Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div key={video.id} className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2 text-[#0F172A]">{video.title}</h3>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                  className="w-full h-48 rounded-md"
                ></iframe>
              </div>
              <div className="flex justify-between mt-3">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => handleEdit(video)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleDelete(video.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white">No videos available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminVideos;