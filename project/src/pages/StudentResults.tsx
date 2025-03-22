import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface StudentResult {
  candidateKey: string;
  totalMarks: number;
}

const StudentResults: React.FC = () => {
  const { assessmentId } = useParams();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!assessmentId) {
          throw new Error("Assessment ID is missing.");
        }

        const response = await fetch(`http://localhost:5000/api/assessments/${assessmentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch student results.");
        }

        const data = await response.json();
        if (!data.studentAnswerSheets) {
          throw new Error("No student results found in the response.");
        }

        const studentResults = data.studentAnswerSheets.map((sheet: any) => ({
          candidateKey: sheet.candidateKey,
          totalMarks: sheet.totalMarks,
        }));
        setResults(studentResults);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch student results. Please try again.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [assessmentId]);

  const handleViewEvaluation = (candidateKey: string) => {
    navigate(`/assessment-view/${assessmentId}/${candidateKey}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Student Results</h1>
        {results.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No student results found.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <span className="font-medium">Candidate Key: {result.candidateKey}</span>
                  <span className="ml-4">Total Marks: {"23"}</span>
                </div>
                <button
                  onClick={() => handleViewEvaluation(result.candidateKey)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Complete Evaluation
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;