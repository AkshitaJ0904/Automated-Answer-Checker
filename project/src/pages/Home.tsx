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
            <Link to="/Dashboard">
             <h3 className="text-xl font-semibold mb-3">Upload Answer Sheets</h3></Link> 
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