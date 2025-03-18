import React, { useState } from "react";
import { db } from "./firebase"; // Import Firebase Realtime Database
import { ref, push } from "firebase/database";
import teamImage from "./20944338.jpg"; // Import the graphic image
import Navbar from "./Navbar"; // Import the Navbar component
import Footer from "./Footer"; // Import the Footer component

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
    status: "registered",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Push form data to Firebase Realtime Database
      const registrationRef = ref(db, "registrationRequests");
      await push(registrationRef, formData);
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
        status: "registered",
      });
    } catch (error) {
      console.error("Error submitting registration: ", error);
      alert("Error submitting registration. Please try again.");
    }
  };

  return (
    <div className="font-sans bg-gray-50 text-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-white text-gray-900">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
          {/* Image Section */}
          <div className="md:w-1/2 flex justify-center items-center mb-8 md:mb-0 bg-white">
            <img
              src={teamImage}
              alt="Team Graphic"
              className="w-full max-w-md"
            />
          </div>

          {/* Form Section */}
          <div className="md:w-1/2 md:pl-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
              Registration Form
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-black"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-900"
                      required
                    />
                    <span className="ml-2 text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-900"
                      required
                    />
                    <span className="ml-2 text-gray-700">Female</span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-black"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* School */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-black"
                  placeholder="Enter your school name"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-black"
                  placeholder="Enter your country"
                  required
                />
              </div>

              {/* Phone Number (WhatsApp) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-black"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* Parent Phone Number (WhatsApp) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-black"
                  placeholder="Enter parent's phone number"
                  required
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-black"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
                <select
                  name="board"
                  value={formData.board}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-black"
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
                  className="w-full bg-blue-900 text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition duration-300"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegistrationPage;