import React, { useEffect, useState } from "react";
import { db } from "./firebase"; // Import Firebase
import { ref, onValue, update, remove } from "firebase/database";

const RegistrationRequests = () => {
  const [registrations, setRegistrations] = useState([]);

  // Fetch registration requests from Firebase Realtime Database
  useEffect(() => {
    const registrationRef = ref(db, "registrationRequests");
    onValue(registrationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the data object into an array
        const registrationArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setRegistrations(registrationArray);
      } else {
        setRegistrations([]);
      }
    });
  }, []);

  // Function to update the status of a registration request
  const updateStatus = (id, newStatus) => {
    const registrationRef = ref(db, `registrationRequests/${id}`);
    update(registrationRef, { status: newStatus })
      .then(() => {
        alert("Status updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating status: ", error);
        alert("Error updating status. Please try again.");
      });
  };

  // Function to delete a registration request
  const deleteRegistration = (id) => {
    const registrationRef = ref(db, `registrationRequests/${id}`);
    remove(registrationRef)
      .then(() => {
        alert("Registration deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting registration: ", error);
        alert("Error deleting registration. Please try again.");
      });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Registration Requests</h2>
      {registrations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  School
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Parent Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Board
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {registrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-600">
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.gender}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.school}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.country}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.parentPhone}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.course}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{registration.board}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        registration.status === "Registered"
                          ? "bg-blue-500 text-white"
                          : registration.status === "Contacted"
                          ? "bg-green-500 text-white"
                          : registration.status === "Not Interested"
                          ? "bg-red-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {registration.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateStatus(registration.id, "Registered")}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-200"
                      >
                        Registered
                      </button>
                      <button
                        onClick={() => updateStatus(registration.id, "Contacted")}
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                      >
                        Contacted
                      </button>
                      <button
                        onClick={() => updateStatus(registration.id, "Not Interested")}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                      >
                        Not Interested
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-200">
                    <button
                      onClick={() => deleteRegistration(registration.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No registration requests found.</p>
      )}
    </div>
  );
};

export default RegistrationRequests;