import React, { useEffect, useState } from "react";
import { db, ref, push, onValue, remove } from "./firebase";

const AdminHomeworks = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available courses
  useEffect(() => {
    const coursesRef = ref(db, 'courses');
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      setIsLoading(true);
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        const courseList = Object.keys(coursesData).filter(key => key && key !== 'undefined');
        setCourses(courseList);
        
        if (!selectedCourse && courseList.length > 0) {
          setSelectedCourse(courseList[0]);
        }
      } else {
        setCourses([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribeCourses();
  }, []);

  // Fetch homeworks for selected course
  useEffect(() => {
    if (!selectedCourse) {
      setHomeworks([]);
      return;
    }

    setIsLoading(true);
    const homeworksRef = ref(db, `courses/${selectedCourse}/homeworks`);
    const unsubscribeHomeworks = onValue(homeworksRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedHomeworks = Object.entries(data).map(([id, hw]) => ({
          id,
          ...hw,
          dueDate: hw.dueDate || "No due date",
          createdAt: hw.createdAt || new Date().toISOString()
        }));
        
        const sortedHomeworks = formattedHomeworks.sort((a, b) => {
          return new Date(b.dueDate) - new Date(a.dueDate) || 
                 new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setHomeworks(sortedHomeworks);
      } else {
        setHomeworks([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribeHomeworks();
  }, [selectedCourse]);

  const handleAddHomework = (e) => {
    e.preventDefault();
    if (title && description && dueDate && selectedCourse) {
      const homeworksRef = ref(db, `courses/${selectedCourse}/homeworks`);
      push(homeworksRef, { 
        title, 
        description, 
        dueDate,
        createdAt: new Date().toISOString()
      });

      setTitle("");
      setDescription("");
      setDueDate("");
    }
  };

  const handleDeleteHomework = (id) => {
    if (window.confirm("Are you sure you want to delete this homework?")) {
      const homeworkRef = ref(db, `courses/${selectedCourse}/homeworks/${id}`);
      remove(homeworkRef);
    }
  };

  const isPastDue = (dueDate) => {
    if (!dueDate || dueDate === "No due date") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "No due date") return "No due date";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Homework Management</h1>
          
          <div className="flex flex-wrap gap-2">
            {courses.map(course => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base ${
                  selectedCourse === course
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {course} Course
              </button>
            ))}
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No courses available</h3>
              <p className="mt-1 text-gray-500">Please create courses in your database first.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Add Homework Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Homework</h2>
              <form onSubmit={handleAddHomework} className="text-black">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                    <input
                      type="text"
                      placeholder="Homework title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                    <textarea
                      placeholder="Homework description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date*</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!title || !description || !dueDate || !selectedCourse}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Homework
                </button>
              </form>
            </div>

            {/* Homework List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedCourse} Course Homeworks
                </h2>
                <span className="text-sm text-gray-500">
                  {homeworks.length} {homeworks.length === 1 ? 'assignment' : 'assignments'}
                </span>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : homeworks.length > 0 ? (
                <div className="space-y-4">
                  {homeworks.map((hw) => (
                    <div 
                      key={hw.id} 
                      className={`p-5 rounded-lg border transition-all ${
                        isPastDue(hw.dueDate) 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{hw.title}</h3>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap">{hw.description}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isPastDue(hw.dueDate)
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {isPastDue(hw.dueDate) ? 'Past Due' : 'Active'}
                            </span>
                            <span className="text-sm text-gray-500">
                              Due: {formatDate(hw.dueDate)}
                            </span>
                            {hw.createdAt && (
                              <span className="text-sm text-gray-400">
                                Created: {formatDate(hw.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete homework"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No homeworks in this course</h3>
                  <p className="mt-1 text-sm text-gray-500">Create your first homework assignment.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminHomeworks;