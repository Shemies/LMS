import React, { useEffect, useState } from "react";
import { db, ref, onValue } from "./firebase";
import Layout from "./Layout";

const MarkSchemes = () => {
  const [markSchemes, setMarkSchemes] = useState({});

  useEffect(() => {
    const markSchemesRef = ref(db, "markschemes");

    onValue(markSchemesRef, (snapshot) => {
      if (snapshot.exists()) {
        setMarkSchemes(snapshot.val());
      } else {
        setMarkSchemes({});
      }
    });
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-white mb-6">Mark Schemes</h1>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[80%] mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Chapters</h3>

        {Object.keys(markSchemes).length > 0 ? (
          Object.entries(markSchemes).map(([chapter, pdfs]) => (
            <div key={chapter} className="mb-6">
              <h4 className="text-md font-bold text-[#1E293B] mb-2">{chapter}</h4>
              <ul className="space-y-2">
                {Object.entries(pdfs).map(([pdfKey, pdf]) => (
                  <li key={pdfKey} className="p-3 bg-gray-100 rounded-lg">
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {pdf.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No PDFs available.</p>
        )}
      </div>
    </Layout>
  );
};

export default MarkSchemes;
