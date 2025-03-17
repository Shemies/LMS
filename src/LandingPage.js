import React from "react";
import teamImage from "./20944338.jpg"; // Import the graphic image

const LandingPage = () => {
  return (
    <div className="font-sans bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-blue-900">Math IGCSE</div>
            <div className="flex space-x-4">
              <a
                href="/login"
                className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Login
              </a>
              <a
                href="/register"
                className="bg-transparent border border-blue-900 text-blue-900 px-4 py-2 rounded-md hover:bg-blue-900 hover:text-white transition duration-300"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-white text-gray-900">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
          {/* Text Half */}
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Master Math IGCSE with Confidence
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Unlock your potential with our comprehensive platform designed to help you ace your Math IGCSE exams.
            </p>
            <div className="space-x-4">
              <a
                href="/register"
                className="bg-blue-900 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
              >
                Get Started
              </a>
              <a
                href="#features"
                className="bg-transparent border border-blue-900 text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-blue-900 hover:text-white transition duration-300"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Image Half */}
          <div className="md:w-1/2 flex justify-center">
            <img
              src={teamImage}
              alt="Team Graphic"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-blue-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100" >Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            {/* Feature 1 */}
            <div className="text-center bg-gray-50 p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="bg-blue-100 text-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Materials</h3>
              <p className="text-gray-600">
                Access past papers, video tutorials, and interactive problem-solving tools.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="bg-blue-100 text-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Teachers</h3>
              <p className="text-gray-600">
                Learn from experienced Math IGCSE teachers with proven track records.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="bg-blue-100 text-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Progress Tracking</h3>
              <p className="text-gray-600">
                Track your progress with homework, exam grades, and announcements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted By</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {/* Stat 1 */}
            <div>
              <h3 className="text-5xl font-bold text-blue-900">15+</h3>
              <p className="text-gray-600">Schools trusting us</p>
            </div>
            {/* Stat 2 */}
            <div>
              <h3 className="text-5xl font-bold text-blue-900">10k+</h3>
              <p className="text-gray-600">Students joined</p>
            </div>
            {/* Stat 3 */}
            <div>
              <h3 className="text-5xl font-bold text-blue-900">100+</h3>
              <p className="text-gray-600">Dedicated assistants</p>
            </div>
            {/* Stat 4 */}
            <div>
              <h3 className="text-5xl font-bold text-blue-900">80%</h3>
              <p className="text-gray-600">Scored A or higher</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-900 text-4xl font-bold">J</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">John Doe</h3>
              <p className="text-gray-600 text-center">Math IGCSE Teacher</p>
              <p className="text-gray-600 text-center mt-4">
                With over a two decade of experience, he specializes in making complex topics easy to understand.
              </p>
            </div>
            {/* Team Member 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-900 text-4xl font-bold">S</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Sarah Smith</h3>
              <p className="text-gray-600 text-center">Math Co-Teacher</p>
              <p className="text-gray-600 text-center mt-4">
                He focuses on breaking down theoretical concepts into digestible lessons.
              </p>
            </div>
            {/* Team Member 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-900 text-4xl font-bold">M</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Mike Johnson</h3>
              <p className="text-gray-600 text-center">MAth Co-Teacher</p>
              <p className="text-gray-600 text-center mt-4">
                He is passionate about practical problem-solving and exam preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2023 Math IGCSE Pro. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => window.open("https://facebook.com", "_blank")}
              className="hover:text-blue-900"
            >
              Facebook
            </button>
            <button
              onClick={() => window.open("https://instagram.com", "_blank")}
              className="hover:text-blue-900"
            >
              Instagram
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;