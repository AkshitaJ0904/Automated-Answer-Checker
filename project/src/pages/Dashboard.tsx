import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText } from "lucide-react";
import { DashboardAssessment } from "../types";
import { assessmentService } from "../components/services/api";

const Dashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<DashboardAssessment[]>([]);
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [newAssessmentName, setNewAssessmentName] = useState("");
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [teacherAnswerSheet, setTeacherAnswerSheet] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch assessments on component mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await assessmentService.getAssessments();
        setAssessments(data);
      } catch (error) {
        console.error("Failed to fetch assessments:", error);
      }
    };

    fetchAssessments();
  }, []);

  // Handle file input changes
  const handleQuestionPaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuestionPaper(e.target.files[0]);
    }
  };

  const handleAnswerSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTeacherAnswerSheet(e.target.files[0]);
    }
  };

  // Handle creating a new assessment
  const handleCreateAssessment = async () => {
    try {
      setError("");
      setIsLoading(true);

      // Validate inputs
      if (!newAssessmentName?.trim()) {
        throw new Error("Please provide an assessment name");
      }

      if (!questionPaper) {
        throw new Error("Please upload the question paper");
      }

      if (!teacherAnswerSheet) {
        throw new Error("Please upload the teacher's answer sheet");
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("assessmentName", newAssessmentName.trim());
      formData.append("teacherQuestionPaper", questionPaper);
      formData.append("teacherAnswerSheet", teacherAnswerSheet);

      // Create assessment
      const result = await assessmentService.createAssessment(formData);

      // Navigate to upload student answers page
      navigate(`/upload-student-answers/${result.assessmentId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      console.error("Create assessment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicking on an assessment
  const handleAssessmentClick = (assessment: DashboardAssessment) => {
    navigate(`/assessment/${assessment.id}`);
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

      {/* New Assessment Form */}
      {showNewAssessment && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Assessment</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="assessment-name" className="block text-sm font-medium text-gray-700 mb-1">
                Exam Name
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
              <label htmlFor="question-paper" className="block text-sm font-medium text-gray-700 mb-1">
                Question Paper
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer bg-gray-50 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center">
                  <Upload size={18} className="mr-2 text-gray-500" />
                  <span>{questionPaper ? questionPaper.name : "Upload Question Paper"}</span>
                  <input
                    type="file"
                    id="question-paper"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleQuestionPaperChange}
                  />
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">Upload the question paper in PDF or image format</p>
            </div>

            <div>
              <label htmlFor="teacher-answer-sheet" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher's Answer Sheet
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer bg-gray-50 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center">
                  <Upload size={18} className="mr-2 text-gray-500" />
                  <span>{teacherAnswerSheet ? teacherAnswerSheet.name : "Upload Answer Sheet"}</span>
                  <input
                    type="file"
                    id="teacher-answer-sheet"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleAnswerSheetChange}
                  />
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">Upload the answer key in PDF or image format</p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowNewAssessment(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssessment}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Assessment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessments List */}
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
              <h3 className="text-lg font-semibold mb-2">{assessment.examName}</h3>
              <div className="text-sm text-gray-500 mb-2">
                Created: {new Date(assessment.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Questions: {assessment.totalQuestions}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Status: <span className="capitalize">{assessment.status}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FileText size={16} className="mr-1" />
                <span>View Details</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;