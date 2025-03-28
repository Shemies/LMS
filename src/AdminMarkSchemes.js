import React, { useState, useEffect } from "react";
import { db, ref, set, push, onValue, remove } from "./firebase";

const AdminMarkSchemes = () => {
  const [markSchemes, setMarkSchemes] = useState({});
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState("AS"); // Default active course
  const [chapter, setChapter] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

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
    if (chapter && pdfName && pdfUrl) {
      const chapterRef = ref(db, `courses/${activeCourse}/markschemes/${chapter}`);
      push(chapterRef, { name: pdfName, url: pdfUrl });

      setPdfName("");
      setPdfUrl("");
    }
  };

  // Delete a PDF
  const handleDeletePdf = (chapter, pdfKey) => {
    const pdfRef = ref(db, `courses/${activeCourse}/markschemes/${chapter}/${pdfKey}`);
    remove(pdfRef);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Mark Schemes</h1>

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

      {/* Form to Add PDFs */}
      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[80%] mx-auto mb-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Add New Mark Scheme</h3>
        <input
          type="text"
          placeholder="Chapter Name"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <input
          type="text"
          placeholder="PDF Name"
          value={pdfName}
          onChange={(e) => setPdfName(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <input
          type="text"
          placeholder="PDF URL"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <button
          onClick={handleAddPdf}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Mark Scheme
        </button>
      </div>

      {/* Display Existing PDFs */}
      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[80%] mx-auto">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Existing Mark Schemes</h3>

        {Object.keys(markSchemes).length > 0 ? (
          Object.entries(markSchemes).map(([chapter, pdfs]) => (
            <div key={chapter} className="mb-6">
              <h4 className="text-md font-bold text-[#1E293B] mb-2">{chapter}</h4>
              <ul className="space-y-2">
                {Object.entries(pdfs).map(([pdfKey, pdf]) => (
                  <li key={pdfKey} className="p-3 bg-gray-100 rounded-lg flex justify-between">
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {pdf.name}
                    </a>
                    <button
                      onClick={() => handleDeletePdf(chapter, pdfKey)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No mark schemes available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminMarkSchemes;