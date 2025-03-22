import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Check, X } from "lucide-react";

interface Student {
  candidateKey: string;
  answerFile: File | null;
}

const UploadStudentAnswers: React.FC = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([{ candidateKey: "", answerFile: null }]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCandidateKeyChange = (index: number, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index].candidateKey = value;
    setStudents(updatedStudents);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updatedStudents = [...students];
    updatedStudents[index].answerFile = file;
    setStudents(updatedStudents);
  };

  const addStudentRow = () => {
    setStudents([...students, { candidateKey: "", answerFile: null }]);
  };

  const removeStudentRow = (index: number) => {
    if (students.length > 1) {
      const updatedStudents = students.filter((_, i) => i !== index);
      setStudents(updatedStudents);
    }
  };

  const handleSubmit = async () => {
    if (!assessmentId) {
      setError("Assessment ID is missing. Please ensure you're accessing this page correctly.");
      return;
    }
  
    // Validate inputs
    for (const student of students) {
      if (!student.candidateKey || !student.answerFile) {
        setError("Please fill in all fields for every student.");
        return;
      }
    }
  
    setUploading(true);
    setError("");
  
    const formData = new FormData();
    formData.append("assessmentId", assessmentId);
  
    students.forEach((student) => {
      if (student.answerFile) {
        formData.append("answerFiles[]", student.answerFile);
        formData.append("candidateKeys[]", student.candidateKey);
      }
    });
  
    console.log("Form Data:", formData); // Log form data
  
    try {
      const response = await fetch("http://localhost:5000/upload-student-answers", {
        method: "POST",
        body: formData,
      });
  
      console.log("Response Status:", response.status); // Log response status
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Data:", errorData); // Log error data
        throw new Error(errorData.error || "Failed to upload student answer sheets");
      }
  
      const result = await response.json();
      console.log("Result:", result); // Log result
  
      if (result.message === "Student answer sheets uploaded successfully") {
        setUploadSuccess(true);
        setTimeout(() => {
          navigate(`/student-results/${assessmentId}`);
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to upload student answer sheets");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload student answer sheets. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Upload Student Answer Sheets</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <Check size={16} className="inline mr-2" />
            Student answer sheets uploaded successfully! Redirecting...
          </div>
        )}

        {students.map((student, index) => (
          <div key={index} className="mb-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`candidate-key-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Candidate Key
                </label>
                <input
                  type="text"
                  id={`candidate-key-${index}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={student.candidateKey}
                  onChange={(e) => handleCandidateKeyChange(index, e.target.value)}
                  placeholder="Enter candidate key"
                />
              </div>
              <div>
                <label htmlFor={`answer-file-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Answer File
                </label>
                <input
                  type="file"
                  id={`answer-file-${index}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleFileChange(index, e.target.files ? e.target.files[0] : null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            {students.length > 1 && (
              <button
                onClick={() => removeStudentRow(index)}
                className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                title="Remove student"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}

        <div className="flex justify-between">
          <button
            onClick={addStudentRow}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Add Another Student
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {uploading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Uploading...
              </span>
            ) : (
              "Upload and Process"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadStudentAnswers;