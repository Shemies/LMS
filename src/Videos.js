import React, { useState, useEffect } from "react";
import { db, ref, onValue } from "./firebase";
import Layout from "./Layout";

const Videos = () => {
  const [videos, setVideos] = useState([]);

  // Fetch videos from Firebase
  useEffect(() => {
    const videosRef = ref(db, "videos");
    const unsubscribe = onValue(videosRef, (snapshot) => {
      if (snapshot.exists()) {
        const videoData = snapshot.val();
        const videoList = Object.keys(videoData).map((key) => ({
          id: key,
          ...videoData[key],
        }));
        setVideos(videoList);
      } else {
        setVideos([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-white mb-6">Videos</h1>

      {/* Video List */}
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
            </div>
          ))
        ) : (
          <p className="text-white">No videos available.</p>
        )}
      </div>
    </Layout>
  );
};

export default Videos;
