import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AssessmentView from './pages/AssessmentView';
import UploadStudentAnswers from './pages/UploadStudentAnswers';
import StudentResults from './pages/StudentResults';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }  
              />
              <Route 
                path="/assessment-view/:assessmentId/:candidateKey"
                element={
                  <ProtectedRoute>
                    <AssessmentView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload-student-answers/:assessmentId"
                element={
                  <ProtectedRoute>
                    <UploadStudentAnswers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student-results/:assessmentId"
                element={
                  <ProtectedRoute>
                    <StudentResults />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <footer className="bg-white border-t py-4">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} AnswerChecker. All rights reserved.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;