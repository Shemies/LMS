import React, { useState, useEffect } from "react";
import { ref, push, onValue, remove } from "firebase/database";
import { db } from "./firebase";

const AdminMarkSchemes = () => {
  // State declarations
  const [markSchemes, setMarkSchemes] = useState({});
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("OL"); // Default to OL like UsersManagement
  const [chapter, setChapter] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch mark schemes for the active course from Firebase
  useEffect(() => {
    const markSchemesRef = ref(db, `courses/${activeCourse}/markschemes`);
    const unsubscribeMarkSchemes = onValue(markSchemesRef, (snapshot) => {
      if (snapshot.exists()) {
        setMarkSchemes(snapshot.val());
      } else {
        setMarkSchemes({});
      }
    });

    return () => unsubscribeMarkSchemes();
  }, [activeCourse]);

  // Add new PDF
  const handleAddPdf = () => {
    if (!chapter || !pdfName || !pdfUrl) {
      alert("Please fill in all fields");
      return;
    }

    const chapterRef = ref(db, `courses/${activeCourse}/markschemes/${chapter}`);
    push(chapterRef, { name: pdfName, url: pdfUrl })
      .then(() => {
        alert("Mark scheme added successfully");
        setChapter("");
        setPdfName("");
        setPdfUrl("");
        setIsAddFormExpanded(false);
      })
      .catch(error => alert("Error adding mark scheme: " + error.message));
  };

  // Delete a PDF
  const handleDeletePdf = (chapter, pdfKey) => {
    if (window.confirm("Are you sure you want to delete this mark scheme?")) {
      const pdfRef = ref(db, `courses/${activeCourse}/markschemes/${chapter}/${pdfKey}`);
      remove(pdfRef)
        .then(() => alert("Mark scheme deleted successfully"))
        .catch(error => alert("Error deleting mark scheme: " + error.message));
    }
  };

  // Filter mark schemes based on search query
  const filteredMarkSchemes = React.useMemo(() => {
    if (!searchQuery) return markSchemes;
    
    const filtered = {};
    Object.entries(markSchemes).forEach(([chapterName, pdfs]) => {
      if (chapterName.toLowerCase().includes(searchQuery.toLowerCase())) {
        filtered[chapterName] = pdfs;
      } else {
        const matchingPdfs = Object.entries(pdfs).filter(([_, pdf]) => 
          pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (matchingPdfs.length > 0) {
          filtered[chapterName] = Object.fromEntries(matchingPdfs);
        }
      }
    });
    return filtered;
  }, [markSchemes, searchQuery]);

  return (
    <div className="p-4 text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Mark Schemes Management</h1>

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

      {/* Search and Add Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search mark schemes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md"
        />
        <button
          onClick={() => setIsAddFormExpanded(!isAddFormExpanded)}
          className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
        >
          {isAddFormExpanded ? "Cancel" : "Add New Mark Scheme"}
        </button>
      </div>

      {/* Add Mark Scheme Form */}
      {isAddFormExpanded && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Mark Scheme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chapter Name*</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PDF Name*</label>
              <input
                type="text"
                value={pdfName}
                onChange={(e) => setPdfName(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">PDF URL*</label>
              <input
                type="text"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setIsAddFormExpanded(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPdf}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Mark Scheme
            </button>
          </div>
        </div>
      )}

      {/* Mark Schemes Display */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {Object.keys(filteredMarkSchemes).length > 0 ? (
          <div className="divide-y divide-gray-200">
            {Object.entries(filteredMarkSchemes).map(([chapterName, pdfs]) => (
              <div key={chapterName} className="p-4">
                <h3 className="text-lg font-semibold mb-3">{chapterName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(pdfs).map(([pdfKey, pdf]) => (
                    <div key={pdfKey} className="border rounded-md p-3 flex justify-between items-center hover:bg-gray-50">
                      <a
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex-1"
                      >
                        {pdf.name}
                      </a>
                      <button
                        onClick={() => handleDeletePdf(chapterName, pdfKey)}
                        className="text-red-600 hover:text-red-800 ml-2 p-1"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No mark schemes found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMarkSchemes;