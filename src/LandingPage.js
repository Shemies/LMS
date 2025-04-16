import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { FaWhatsapp } from "react-icons/fa";

// Import images for the carousel
import teamImage from "./20944338.jpg";
import teamImage1 from "./assets/team1.png";
import teamImage2 from "./assets/team2.png";
import teamImage3 from "./assets/team3.png";
import teamImage4 from "./assets/team4.png";
import teamImage5 from "./assets/team5.png";
import teamImage6 from "./assets/team6.png";
import teamImage7 from "./assets/team7.png";

const LandingPage = () => {
  const openWhatsAppChat = () => {
    const phoneNumber = "201004672283";
    const message = "Hello, I'm interested in learning more about your Math IGCSE courses.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="font-sans bg-gray-50 text-gray-900 relative">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-white text-gray-900">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
          {/* Text Half */}
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Achieve the Highest Grades in Math
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Learn from experienced teachers who specialize in Math IGCSE and have a proven track record of helping students achieve top grades.
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-blue-900 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
              >
                Register Now
              </Link>
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
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">
            Why Team Abbassi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <h3 className="text-xl font-semibold mb-2">Extensive Resources</h3>
              <p className="text-gray-600">
                Access Markschemes, Video lessons, and Pastpapers.
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
              <h3 className="text-xl font-semibold mb-2">
                Highly Qualified and Experienced Instructors
              </h3>
              <p className="text-gray-600">
                Learn from experienced Maths teachers with a track record of excellence.
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
              <h3 className="text-xl font-semibold mb-2">
                Immediate Student Progress Updates
              </h3>
              <p className="text-gray-600">
                Monitor your progress through homework, exam results, and important announcements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Stat 1 */}
            <div>
              <h3 className="text-5xl font-bold text-blue-900">20+</h3>
              <p className="text-gray-600">Years of experience</p>
            </div>
            {/* Stat 2 */}
            <div>
              <h3 className="text-5xl font-bold text-blue-900">10k+</h3>
              <p className="text-gray-600">Students joined</p>
            </div>
            {/* Stat 3 */}
            <div>
              <h3 className="text-5xl font-bold text-blue-900">73%</h3>
              <p className="text-gray-600">Scored A* and A</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-blue-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Founder</h2>
          <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-blue-900 text-4xl font-bold">MA</span>
          </div>
          <h3 className="text-2xl text-white font-semibold text-center mb-2">Mohamed Abbassi</h3>
          <p className="text-gray-200 text-center">Math IGCSE Teacher</p>
          <p className="text-gray-200 text-center mt-4">
            With over two decades of experience, he specializes in making complex topics easy to understand.
          </p>
        </div>
      </section>

      {/* Photo Carousel Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Gallery</h2>
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            className="w-full"
          >
            <SwiperSlide>
              <img
                src={teamImage1}
                alt="Team Graphic 1"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={teamImage2}
                alt="Team Graphic 2"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={teamImage3}
                alt="Team Graphic 3"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={teamImage4}
                alt="Team Graphic 4"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={teamImage5}
                alt="Team Graphic 5"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={teamImage6}
                alt="Team Graphic 6"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={teamImage7}
                alt="Team Graphic 7"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <div 
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-green-600 transition-colors duration-300 z-50"
        onClick={openWhatsAppChat}
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </div>
    </div>
  );
};

export default LandingPage;