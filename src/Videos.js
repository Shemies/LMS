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
  const [activeVideoId, setActiveVideoId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const usersRef = ref(db, "users");
        const unsubscribeUsers = onValue(
          usersRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const usersData = snapshot.val();
              const authenticatedUser = Object.values(usersData).find(
                (u) => u.email === user.email
              );

              if (authenticatedUser) {
                if (authenticatedUser.enrolledCourse) {
                  setEnrolledCourse(authenticatedUser.enrolledCourse);
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

        return () => unsubscribeUsers();
      } else {
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!enrolledCourse) return;

    const videosRef = ref(db, `courses/${enrolledCourse}/videos`);
    const unsubscribeVideos = onValue(
      videosRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const videoData = snapshot.val();
          // Filter videos to only include published ones (published !== false)
          const videoList = Object.keys(videoData)
            .map((key) => ({
              id: key,
              ...videoData[key],
            }))
            .filter(video => video.published !== false); // Only show published videos
          
          setVideos(videoList);
          setFilteredVideos(videoList);
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

    return () => unsubscribeVideos();
  }, [enrolledCourse]);

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

  const toggleVideo = (videoId) => {
    setActiveVideoId(activeVideoId === videoId ? null : videoId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </Layout>
    );
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
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleVideo(video.id)}
                >
                  <h3 className="text-xl font-semibold text-[#0F172A]">{video.title}</h3>
                  <span className="text-gray-600">
                    {activeVideoId === video.id ? "▲" : "▼"}
                  </span>
                </div>

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
            <p className="text-gray-600">No published videos found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Videos;