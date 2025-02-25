import React, { useState, useEffect } from "react";
import { db, ref, push, onValue, remove } from "./firebase";
import Layout from "./Layout";

const AdminPastPapers = () => {
  const [pastPapers, setPastPapers] = useState({});
  const [selectedYear, setSelectedYear] = useState(null);
  const [year, setYear] = useState("");
  const [session, setSession] = useState("Jan");
  const [folder, setFolder] = useState("QP");
  const [paperName, setPaperName] = useState("");
  const [paperUrl, setPaperUrl] = useState("");

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

  const handleAddPaper = () => {
    if (year && session && folder && paperName && paperUrl) {
      const paperRef = ref(db, `pastpapers/${year}/${session}/${folder}`);
      push(paperRef, { name: paperName, file: paperUrl });
      setPaperName(" ");
      setPaperUrl(" ");
    }
  };

  const handleDeletePaper = (year, session, folder, paperKey) => {
    const paperRef = ref(db, `pastpapers/${year}/${session}/${folder}/${paperKey}`);
    remove(paperRef);
  };

  const handleYearToggle = (year) => {
    setSelectedYear((prev) => (prev === year ? null : year));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">PastPapers</h1>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[80%] mx-auto mb-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Add New Past Paper</h3>
        <input
          type="number"
          placeholder="Year (e.g. 2024)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <select value={session} onChange={(e) => setSession(e.target.value)} className="border p-2 rounded-lg w-full mb-3 text-black">
          <option value="Jan">January</option>
          <option value="March">March</option>
          <option value="June">June</option>
          <option value="Nov">November</option>
        </select>
        <select value={folder} onChange={(e) => setFolder(e.target.value)} className="border p-2 rounded-lg w-full mb-3 text-black">
          <option value="QP">Question Papers</option>
          <option value="MS">Mark Schemes</option>
        </select>
        <input
          type="text"
          placeholder="Paper"
          value={paperName}
          onChange={(e) => setPaperName(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <input
          type="text"
          placeholder="Paper URL"
          value={paperUrl}
          onChange={(e) => setPaperUrl(e.target.value)}
          className="border p-2 rounded-lg w-full mb-3 text-black"
        />
        <button onClick={handleAddPaper} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Add Past Paper
        </button>
      </div>

      <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200 w-[90%] sm:w-[80%] mx-auto">
        {Object.keys(pastPapers)
          .sort((a, b) => b - a)
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
                        <div key={folder} className="ml-4 mb-4">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">{folder === "QP" ? "Question Papers" : "Mark Schemes"}</h6>
                          <ul className="space-y-2">
                            {Object.entries(pastPapers[year][session][folder]).map(([paperKey, paper]) => (
                              <li key={paperKey} className="p-3 bg-gray-100 rounded-lg flex justify-between">
                                <a href={paper.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {paper.name}
                                </a>
                                <button
                                  onClick={() => handleDeletePaper(year, session, folder, paperKey)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✖
                                </button>
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
    </div>
  );
};

export default AdminPastPapers;
