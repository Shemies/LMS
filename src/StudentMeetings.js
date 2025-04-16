import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "./Layout";

const StudentMeetings = () => {
  const [allMeetings, setAllMeetings] = useState([]);
  const [enrolledCourse, setEnrolledCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);

  // Fetch user data and enrolled course
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const usersRef = ref(db, "users");
        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            const usersData = snapshot.val();
            const studentData = Object.values(usersData).find(
              (u) => u.email === user.email
            );

            if (studentData) {
              if (studentData.enrolledCourse) {
                setEnrolledCourse(studentData.enrolledCourse);
              } else {
                setError("You are not enrolled in any course.");
                setLoading(false);
              }
            } else {
              setError("Student data not found.");
              setLoading(false);
            }
          } else {
            setError("No users found in the database.");
            setLoading(false);
          }
        });

        return () => unsubscribeUsers();
      } else {
        setError("Please log in to view meetings.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch meetings for enrolled course from courses/{courseId}/meetings
  useEffect(() => {
    if (!enrolledCourse) return;

    const meetingsRef = ref(db, `courses/${enrolledCourse}/meetings`);
    const unsubscribeMeetings = onValue(meetingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const meetingsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
          meetingTime: data.meetingTime || "",
          isOnlineMeeting: data.isOnlineMeeting !== false // Default to true
        }));
        setAllMeetings(meetingsData);
      } else {
        setAllMeetings([]);
      }
      setLoading(false);
    });

    return () => unsubscribeMeetings();
  }, [enrolledCourse]);

  // Helper function to check if meeting has ended (2 hours after meeting time)
  const isMeetingEnded = (meetingTime) => {
    if (!meetingTime) return true;
    
    const now = new Date();
    const meetingDate = new Date(meetingTime);
    const twoHoursAfter = new Date(meetingDate.getTime() + 2 * 60 * 60 * 1000);
    
    return now > twoHoursAfter;
  };

  // Filter meetings based on active tab and search query
  const filteredMeetings = React.useMemo(() => {
    return allMeetings.filter(meeting => {
      // Filter by tab type - keep original tab logic
      const isOnlineMeeting = meeting.isOnlineMeeting;
      const isRecording = !meeting.isOnlineMeeting;
      
      const matchesTab = activeTab === 'upcoming' ? isOnlineMeeting : isRecording;
      
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meeting.description && meeting.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesTab && matchesSearch;
    }).sort((a, b) => {
      // Sort all meetings by time (newest first for recordings)
      return activeTab === 'upcoming' 
        ? new Date(a.meetingTime) - new Date(b.meetingTime)
        : new Date(b.meetingTime) - new Date(a.meetingTime);
    });
  }, [allMeetings, activeTab, searchQuery]);

  const toggleMeetingDetails = (id) => {
    setExpandedMeetingId(expandedMeetingId === id ? null : id);
  };

  // Helper function to show meeting status
  const getMeetingStatus = (meetingTime) => {
    if (!meetingTime) return "No time specified";
    
    if (isMeetingEnded(meetingTime)) return "Meeting ended";
    
    const now = new Date();
    const meetingDate = new Date(meetingTime);
    const diff = meetingDate - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let result = [];
    if (days > 0) result.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) result.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0 && days === 0) result.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    
    return result.join(" and ") || "less than a minute";
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
          <p className="text-red-600 text-center max-w-md p-4">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-3xl font-bold text-black mb-6">Course Meetings</h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            All Meetings
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'recordings' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('recordings')}
          >
            Recordings
          </button>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleMeetingDetails(meeting.id)}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{meeting.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(meeting.meetingTime).toLocaleString()}
                      {activeTab === 'upcoming' && (
                        <span className="ml-2 text-gray-500">
                          ({getMeetingStatus(meeting.meetingTime)})
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-gray-500">
                    {expandedMeetingId === meeting.id ? '▲' : '▼'}
                  </span>
                </div>

                {expandedMeetingId === meeting.id && (
                  <div className="px-4 pb-4">
                    {meeting.description && (
                      <p className="text-gray-700 mb-4">{meeting.description}</p>
                    )}
                    {meeting.link && (
                      <a
                        href={meeting.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-block px-4 py-2 rounded-md text-white ${activeTab === 'upcoming' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                      >
                        {activeTab === 'upcoming' 
                          ? isMeetingEnded(meeting.meetingTime) ? 'View Details' : 'Join Meeting'
                          : 'Watch Recording'}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {activeTab === 'upcoming' 
                  ? 'No meetings scheduled' 
                  : 'No recordings available yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentMeetings;