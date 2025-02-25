import React, { useState, useEffect } from "react";
import { db, ref, onValue } from "./firebase";
import Layout from "./Layout";

const PastPapers = () => {
  const [pastPapers, setPastPapers] = useState({});
  const [selectedYear, setSelectedYear] = useState(null);

  // Fetch past papers from Firebase
  useEffect(() => {
    const papersRef = ref(db, "pastpapers");
    onValue(papersRef, (snapshot) => {
      if (snapshot.exists()) {
        setPastPapers(snapshot.val());
      } else {
        setPastPapers({});
      }
    });
  }, []);

  // Toggle Year View
  const handleYearToggle = (year) => {
    setSelectedYear((prev) => (prev === year ? null : year));
  };

  return (
    <Layout username="Shemies">
      <h1 className="text-3xl font-bold text-white mb-6">Past Papers</h1>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[90%] sm:w-[80%] mx-auto">
        {Object.keys(pastPapers)
          .sort((a, b) => b - a) // Show newest year first
          .map((year) => (
            <div key={year} className="mb-4">
              <button
                onClick={() => handleYearToggle(year)}
                className="w-full text-left text-lg font-bold text-[#1E293B] p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex justify-between items-center"
              >
                {year}
                <span className="text-gray-600">{selectedYear === year ? "▲" : "▼"}</span>
              </button>

              {selectedYear === year && (
                <div className="mt-2 pl-4 border-l-4 border-blue-500">
                  {Object.keys(pastPapers[year]).map((session) => (
                    <div key={session} className="mb-4">
                      <h5 className="text-md font-semibold text-blue-600 mb-2">{session} Session</h5>
                      {Object.keys(pastPapers[year][session]).map((folder) => (
                        <div key={folder} className="mb-2">
                          <h6 className="text-sm font-medium text-gray-700">{folder}</h6>
                          <ul className="space-y-2">
                            {Object.entries(pastPapers[year][session][folder]).map(([key, paper]) => (
                              <li
                                key={key}
                                className="p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                              >
                                <a
                                  href={paper.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {paper.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default PastPapers;
