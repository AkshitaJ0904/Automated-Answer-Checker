#!/bin/bash

# Setup script for Automated Answer Checker project

echo "🚀 Setting up Automated Answer Checker project..."

# Create project directory if it doesn't exist
mkdir -p automated-answer-checker
cd automated-answer-checker

# Initialize a new Vite React TypeScript project
echo "📦 Creating Vite React TypeScript project..."
npm create vite@latest . --template react-ts --yes

# Install dependencies
echo "📚 Installing dependencies..."
npm install react-router-dom axios lucide-react

# Install dev dependencies
echo "🛠️ Installing dev dependencies..."
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/components src/pages src/context src/services

# Create tailwind.config.js
echo "⚙️ Configuring Tailwind CSS..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOF

# Update index.css for Tailwind
echo "🎨 Setting up Tailwind CSS styles..."
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Create types.ts
echo "📝 Creating TypeScript types..."
cat > src/types.ts << 'EOF'
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AnswerSheet {
  id: string;
  name: string;
  file: File | null;
  url?: string;
}

export interface Question {
  id: string;
  number: number;
  marks: number;
  subparts: Subpart[];
}

export interface Subpart {
  id: string;
  label: string;
  maxMarks: number;
  givenMarks: number;
}

export interface Assessment {
  id: string;
  name: string;
  totalMarks: number;
  teacherAnswerSheet: AnswerSheet | null;
  studentAnswerSheet: AnswerSheet | null;
  questions: Question[];
}
EOF

# Create AuthContext.tsx
echo "🔐 Creating authentication context..."
cat > src/context/AuthContext.tsx << 'EOF'
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // This would be replaced with an actual API call
      // For now, we'll simulate a successful login
      const mockUser: User = {
        id: '1',
        username: email.split('@')[0],
        email
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      // This would be replaced with an actual API call
      // For now, we'll simulate a successful signup
      const mockUser: User = {
        id: '1',
        username,
        email
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
EOF

# Create API service
echo "🌐 Creating API service..."
cat > src/services/api.ts << 'EOF'
import axios from 'axios';

// This would be replaced with your actual API URL
const API_URL = 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    // In a real app, this would call your backend API
    // For now, we'll simulate a successful login
    return { user: { id: '1', username: email.split('@')[0], email }, token: 'mock-token' };
  },
  
  signup: async (username: string, email: string, password: string) => {
    // In a real app, this would call your backend API
    // For now, we'll simulate a successful signup
    return { user: { id: '1', username, email }, token: 'mock-token' };
  },
};

// Assessment services
export const assessmentService = {
  uploadAnswerSheets: async (formData: FormData) => {
    // In a real app, this would upload files to your backend
    // For now, we'll simulate a successful upload
    return { success: true, message: 'Files uploaded successfully' };
  },
  
  getAssessments: async () => {
    // In a real app, this would fetch assessments from your backend
    // For now, we'll return an empty array
    return [];
  },
  
  getAssessment: async (id: string) => {
    // In a real app, this would fetch a specific assessment from your backend
    // For now, we'll return null
    return null;
  },
  
  saveMarks: async (assessmentId: string, marks: any) => {
    // In a real app, this would save marks to your backend
    // For now, we'll simulate a successful save
    return { success: true, message: 'Marks saved successfully' };
  },
};

export default api;
EOF

# Create components
echo "🧩 Creating components..."

# Navbar component
cat > src/components/Navbar.tsx << 'EOF'
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <ClipboardCheck size={24} />
          <span className="text-xl font-bold">AnswerChecker</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden md:inline">Welcome, {user.username}</span>
              <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link 
                to="/signup" 
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
EOF

# ProtectedRoute component
cat > src/components/ProtectedRoute.tsx << 'EOF'
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
EOF

# Create pages
echo "📄 Creating pages..."

# Home page
cat > src/pages/Home.tsx << 'EOF'
import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Upload, CheckCircle, BarChart } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Automated Answer Checking Made Simple
            </h1>
            <p className="text-xl mb-8">
              Save time and improve accuracy with our AI-powered answer checking system.
              Upload, analyze, and grade student responses with ease.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-md font-medium text-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium text-lg border border-blue-500"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Upload Answer Sheets</h3>
            <p className="text-gray-600">
              Upload both teacher and student answer sheets to begin the assessment process.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Automated Analysis</h3>
            <p className="text-gray-600">
              Our AI model analyzes student responses and extracts key information for grading.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Manual Verification</h3>
            <p className="text-gray-600">
              Review and adjust AI-suggested marks with our intuitive marking interface.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Comprehensive Reports</h3>
            <p className="text-gray-600">
              Generate detailed reports and analytics on student performance.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Grading Process?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join educators worldwide who are saving time and improving accuracy with our automated answer checking system.
            </p>
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-lg inline-block"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
EOF

# Login page
cat > src/pages/Login.tsx << 'EOF'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
EOF

# Signup page
cat > src/pages/Signup.tsx << 'EOF'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
EOF

# Dashboard page
cat > src/pages/Dashboard.tsx << 'EOF'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText } from 'lucide-react';
import { Assessment, AnswerSheet } from '../types';

const Dashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [newAssessmentName, setNewAssessmentName] = useState('');
  const [teacherAnswerSheet, setTeacherAnswerSheet] = useState<File | null>(null);
  const [studentAnswerSheet, setStudentAnswerSheet] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'teacher' | 'student') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'teacher') {
        setTeacherAnswerSheet(e.target.files[0]);
      } else {
        setStudentAnswerSheet(e.target.files[0]);
      }
    }
  };

  const handleCreateAssessment = () => {
    if (!newAssessmentName) {
      setError('Please provide an assessment name');
      return;
    }
    
    if (!teacherAnswerSheet || !studentAnswerSheet) {
      setError('Please upload both teacher and student answer sheets');
      return;
    }
    
    // In a real application, you would upload these files to your backend
    // For now, we'll create a mock assessment
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      name: newAssessmentName,
      totalMarks: 100,
      teacherAnswerSheet: {
        id: '1',
        name: teacherAnswerSheet.name,
        file: teacherAnswerSheet,
        url: URL.createObjectURL(teacherAnswerSheet)
      },
      studentAnswerSheet: {
        id: '2',
        name: studentAnswerSheet.name,
        file: studentAnswerSheet,
        url: URL.createObjectURL(studentAnswerSheet)
      },
      questions: [
        {
          id: '1',
          number: 1,
          marks: 20,
          subparts: [
            { id: '1a', label: '1a', maxMarks: 5, givenMarks: 0 },
            { id: '1b', label: '1b', maxMarks: 7, givenMarks: 0 },
            { id: '1c', label: '1c', maxMarks: 8, givenMarks: 0 }
          ]
        },
        {
          id: '2',
          number: 2,
          marks: 15,
          subparts: [
            { id: '2a', label: '2a', maxMarks: 8, givenMarks: 0 },
            { id: '2b', label: '2b', maxMarks: 7, givenMarks: 0 }
          ]
        }
      ]
    };
    
    setAssessments([...assessments, newAssessment]);
    setShowNewAssessment(false);
    setNewAssessmentName('');
    setTeacherAnswerSheet(null);
    setStudentAnswerSheet(null);
    setError('');
  };

  const handleAssessmentClick = (assessment: Assessment) => {
    // In a real application, you would navigate to the assessment page with the assessment ID
    navigate(`/assessment/${assessment.id}`, { state: { assessment } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Assessments</h1>
        <button
          onClick={() => setShowNewAssessment(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Upload size={18} className="mr-2" />
          New Assessment
        </button>
      </div>
      
      {showNewAssessment && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Assessment</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="assessment-name" className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Name
              </label>
              <input
                type="text"
                id="assessment-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newAssessmentName}
                onChange={(e) => setNewAssessmentName(e.target.value)}
                placeholder="e.g., Midterm Exam 2023"
              />
            </div>
            
            <div>
              <label htmlFor="teacher-answer-sheet" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher's Answer Sheet
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer bg-gray-50 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center">
                  <Upload size={18} className="mr-2 text-gray-500" />
                  <span>{teacherAnswerSheet ? teacherAnswerSheet.name : 'Upload File'}</span>
                  <input
                    type="file"
                    id="teacher-answer-sheet"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'teacher')}
                  />
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="student-answer-sheet" className="block text-sm font-medium text-gray-700 mb-1">
                Student's Answer Sheet
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer bg-gray-50 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center">
                  <Upload size={18} className="mr-2 text-gray-500" />
                  <span>{studentAnswerSheet ? studentAnswerSheet.name : 'Upload File'}</span>
                  <input
                    type="file"
                    id="student-answer-sheet"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'student')}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowNewAssessment(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssessment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Assessment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {assessments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Assessments Yet</h2>
          <p className="text-gray-500 mb-4">Upload your first assessment to get started</p>
          <button
            onClick={() => setShowNewAssessment(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create New Assessment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              onClick={() => handleAssessmentClick(assessment)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">{assessment.name}</h3>
              <div className="text-sm text-gray-500 mb-4">
                Total Marks: {assessment.totalMarks}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FileText size={16} className="mr-1" />
                <span>{assessment.studentAnswerSheet?.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
EOF

# AssessmentView page
cat > src/pages/AssessmentView.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check } from 'lucide-react';
import { Assessment, Question, Subpart } from '../types';

const AssessmentView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // In a real application, you would fetch the assessment data from your API
    // For now, we'll use the state passed from the Dashboard
    if (location.state?.assessment) {
      setAssessment(location.state.assessment);
      setCurrentQuestion(location.state.assessment.questions[0]);
    }
    setLoading(false);
  }, [location.state]);

  const handleMarkChange = (subpartId: string, marks: number) => {
    if (!assessment || !currentQuestion) return;
    
    // Update the current question's subpart marks
    const updatedSubparts = currentQuestion.subparts.map(subpart => 
      subpart.id === subpartId ? { ...subpart, givenMarks: marks } : subpart
    );
    
    const updatedQuestion = { ...currentQuestion, subparts: updatedSubparts };
    
    // Update the assessment with the updated question
    const updatedQuestions = assessment.questions.map(question => 
      question.id === currentQuestion.id ? updatedQuestion : question
    );
    
    setCurrentQuestion(updatedQuestion);
    setAssessment({ ...assessment, questions: updatedQuestions });
  };

  const handleSave = () => {
    setSaving(true);
    
    // In a real application, you would send the updated assessment to your API
    // For now, we'll simulate a successful save
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      
      // Reset the success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleQuestionChange = (questionId: string) => {
    if (!assessment) return;
    
    const question = assessment.questions.find(q => q.id === questionId);
    if (question) {
      setCurrentQuestion(question);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!assessment || !currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Assessment not found</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{assessment.name}</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Student's answer sheet */}
        <div className="lg:w-2/3 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
            <h2 className="font-semibold">Student's Answer Sheet</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                Previous Page
              </button>
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                Next Page
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {assessment.studentAnswerSheet?.url ? (
              <img 
                src={assessment.studentAnswerSheet.url} 
                alt="Student Answer Sheet" 
                className="w-full h-auto border"
              />
            ) : (
              <div className="flex justify-center items-center h-96 bg-gray-100 text-gray-500">
                No answer sheet available
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Marking panel */}
        <div className="lg:w-1/3 bg-white rounded-lg shadow-md">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="font-semibold">Marking Panel</h2>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={currentQuestion.id}
                onChange={(e) => handleQuestionChange(e.target.value)}
              >
                {assessment.questions.map((question) => (
                  <option key={question.id} value={question.id}>
                    Question {question.number} ({question.marks} marks)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Subparts</h3>
              <div className="space-y-3">
                {currentQuestion.subparts.map((subpart) => (
                  <div key={subpart.id} className="flex items-center">
                    <span className="w-12 text-sm font-medium">{subpart.label}</span>
                    <div className="flex-1 flex items-center">
                      <input
                        type="number"
                        min="0"
                        max={subpart.maxMarks}
                        value={subpart.givenMarks}
                        onChange={(e) => handleMarkChange(subpart.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center"
                      />
                      <span className="mx-2 text-sm text-gray-500">/ {subpart.maxMarks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total for Question {currentQuestion.number}</span>
                <span className="font-medium">
                  {currentQuestion.subparts.reduce((sum, subpart) => sum + subpart.givenMarks, 0)} / {currentQuestion.marks}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Overall Total</span>
                <span className="font-medium">
                  {assessment.questions.reduce((sum, question) => 
                    sum + question.subparts.reduce((subSum, subpart) => subSum + subpart.givenMarks, 0), 0
                  )} / {assessment.totalMarks}
                </span>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : saveSuccess ? (
                  <span className="flex items-center">
                    <Check size={16} className="mr-1" />
                    Saved!
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save size={16} className="mr-1" />
                    Save Marks
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentView;
EOF

# Create App.tsx
echo "🔄 Creating main App component..."
cat > src/App.tsx << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AssessmentView from './pages/AssessmentView';

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