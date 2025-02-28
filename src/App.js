import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProgressProvider } from "./progressContext";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";
import Login from "./Login";
import Logout from "./Logout";
import SignUp from "./SignUp";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import MarkSchemes from "./markschemes";
import Chapters from "./Chapters";
import Videos from "./Videos";
import Homeworks from "./Homeworks";
import Exams from "./Exams";
import PastPapers from "./Pastpapers";
import AdminLayout from "./AdminLayout";
import UsersManagement from "./UsersManagement";
import AdminChapters from "./ChaptersManagment";
import AdminVideos from "./AdminVideos";
import AdminMarkSchemes from "./AdminMarkSchemes";
import AdminHomeworks from "./AdminHomeworks";
import AdminPastPapers from "./AdminPastpapers";
import AdminExamGrades from "./AdminExams";
import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/logout" element={<Logout />} />

            {/* Student Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/markschemes" element={<ProtectedRoute><MarkSchemes /></ProtectedRoute>} />
            <Route path="/chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />
            <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
            <Route path="/homeworks" element={<ProtectedRoute><Homeworks /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
            <Route path="/pastpapers" element={<ProtectedRoute><PastPapers /></ProtectedRoute>} />

            {/* Admin Routes (Restricted) */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="chapters" element={<AdminChapters />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="markschemes" element={<AdminMarkSchemes />} />
              <Route path="homeworks" element={<AdminHomeworks />} />
              <Route path="pastpapers" element={<AdminPastPapers />} />
              <Route path="exams" element={<AdminExamGrades />} />
            </Route>
          </Routes>
        </Router>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;