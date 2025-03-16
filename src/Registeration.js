import React, { useState } from "react";
import { db } from "./firebase"; // Import Firebase
import { collection, addDoc } from "firebase/firestore";
import teamImage from "./20944338.jpg"; // Import the graphic image

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    school: "",
    country: "",
    phone: "",
    parentPhone: "",
    course: "",
    board: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add form data to Firestore
      const docRef = await addDoc(collection(db, "registrationRequests"), formData);
      console.log("Document written with ID: ", docRef.id);
      alert("Registration submitted successfully!");
      setFormData({
        name: "",
        gender: "",
        email: "",
        school: "",
        country: "",
        phone: "",
        parentPhone: "",
        course: "",
        board: "",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting registration. Please try again.");
    }
  };

  return (
    <div className="font-sans bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/2 flex justify-center items-center mb-8 md:mb-0">
          <img
            src={teamImage}
            alt="Team Graphic"
            className="w-full max-w-md rounded-lg"
          />
        </div>

        {/* Form Section */}
        <div className="md:w-1/2 md:pl-8">
          <h2 className="text-3xl font-bold text-center mb-8">Registration Form</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-medium text-gray-700">School</label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Phone Number (WhatsApp) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number (WhatsApp)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Parent Phone Number (WhatsApp) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Phone Number (WhatsApp)</label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="" disabled>Select Course</option>
                <option value="OL">OL</option>
                <option value="AS">AS</option>
                <option value="A2">A2</option>
              </select>
            </div>

            {/* Board */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Board</label>
              <select
                name="board"
                value={formData.board}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="" disabled>Select Board</option>
                <option value="Cambridge">Cambridge</option>
                <option value="Edexcel">Edexcel</option>
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;