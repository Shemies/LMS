import React, { useState, useEffect } from "react";
import { db, ref, onValue } from "./firebase";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "./Layout";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [activeVideoId, setActiveVideoId] = useState(null); // Track the currently active video

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is authenticated:", user.email); // Debugging

        // Fetch all users to find the one matching the authenticated user
        const usersRef = ref(db, "users");
        const unsubscribeUsers = onValue(
          usersRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const usersData = snapshot.val();

              // Find the user with the matching email (or other unique identifier)
              const authenticatedUser = Object.values(usersData).find(
                (u) => u.email === user.email
              );

              if (authenticatedUser) {
                console.log("Authenticated user data:", authenticatedUser); // Debugging
                if (authenticatedUser.enrolledCourse) {
                  setEnrolledCourse(authenticatedUser.enrolledCourse); // Set enrolled course
                } else {
                  setError("No enrolled course found. Please enroll in a course.");
                }
              } else {
                setError("User data not found. Please complete your profile.");
              }
            } else {
              setError("No users found in the database.");
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching users:", error);
            setError("Failed to fetch user data. Please try again later.");
            setLoading(false);
          }
        );

        return () => unsubscribeUsers(); // Cleanup users listener
      } else {
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  useEffect(() => {
    if (!enrolledCourse) return; // Exit if no enrolled course

    // Fetch videos for the enrolled course
    const videosRef = ref(db, `courses/${enrolledCourse}/videos`);
    const unsubscribeVideos = onValue(
      videosRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const videoData = snapshot.val();
          const videoList = Object.keys(videoData).map((key) => ({
            id: key,
            ...videoData[key],
          }));
          setVideos(videoList);
          setFilteredVideos(videoList); // Initialize filtered videos
        } else {
          setVideos([]);
          setFilteredVideos([]);
          setError("No videos found for the enrolled course.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching videos:", error);
        setError("Failed to fetch videos. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribeVideos(); // Cleanup videos listener
  }, [enrolledCourse]); // Re-fetch when enrolledCourse changes

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const filtered = videos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchQuery, videos]);

  // Toggle video visibility
  const toggleVideo = (videoId) => {
    if (activeVideoId === videoId) {
      setActiveVideoId(null); // Close the video if it's already open
    } else {
      setActiveVideoId(videoId); // Open the clicked video
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    ); // Show loading spinner
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </Layout>
    ); // Show error message
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-black mb-6">Videos</h1>

      {/* Search Bar */}
      <div className="container mx-auto px-4 mt-8">
        <input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-black p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Video List */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <div key={video.id} className="bg-white p-6 rounded-lg shadow-lg">
                {/* Video Title (Clickable to toggle visibility) */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleVideo(video.id)}
                >
                  <h3 className="text-xl font-semibold text-[#0F172A]">{video.title}</h3>
                  <span className="text-gray-600">
                    {activeVideoId === video.id ? "▲" : "▼"}
                  </span>
                </div>

                {/* Video Player (Visible only if active) */}
                {activeVideoId === video.id && (
                  <div className="mt-4">
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={video.url}
                        title={video.title}
                        allowFullScreen
                        className="w-full h-48 rounded-md"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">No videos found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Videos;