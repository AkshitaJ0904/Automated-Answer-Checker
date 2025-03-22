import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Check } from 'lucide-react';

interface Question {
  question_number: string;
  max_marks: number;
  awarded_marks: number;
}

interface Assessment {
  exam_name: string;
  questions: Question[];
  total_marks: number;
  candidate_id: string;
}

const AssessmentView: React.FC = () => {
  const navigate = useNavigate();
  const { assessmentId, candidateKey } = useParams<{ assessmentId: string; candidateKey: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        if (!assessmentId || !candidateKey) {
          throw new Error('Missing assessment ID or candidate key.');
        }

        const response = await fetch(
          `http://localhost:5000/api/assessments/${assessmentId}/students/${candidateKey}/evaluation`
        );

        if (!response.ok) {
          throw new Error('Assessment not found');
        }

        const data = await response.json();
        setAssessment(data);
        if (data.questions && data.questions.length > 0) {
          setCurrentQuestion(data.questions[0]);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch evaluation data.');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationData();
  }, [assessmentId, candidateKey]);

  const handleMarkChange = (questionNumber: string, marks: number) => {
    if (!assessment) return;

    const updatedQuestions = assessment.questions.map((question) =>
      question.question_number === questionNumber
        ? { ...question, awarded_marks: marks }
        : question
    );

    setAssessment({ ...assessment, questions: updatedQuestions });

    if (currentQuestion?.question_number === questionNumber) {
      setCurrentQuestion({ ...currentQuestion, awarded_marks: marks });
    }
  };

  const handleSave = async () => {
    if (!assessment || !assessmentId || !candidateKey) return;

    setSaving(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/assessments/${assessmentId}/students/${candidateKey}/evaluation`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questions: assessment.questions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save marks.');
      }

      const result = await response.json();
      setAssessment(prev => prev ? { ...prev, total_marks: result.total_marks } : null);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionChange = (questionNumber: string) => {
    if (!assessment) return;

    const question = assessment.questions.find(
      (q) => q.question_number === questionNumber
    );
    if (question) {
      setCurrentQuestion(question);
    }
  };

  const handleBack = () => {
    navigate(`/student-results/${assessmentId}`);
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
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!assessment || !currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No data found</h1>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{assessment.exam_name}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Right Side: Marking Panel */}
        <div className="lg:w-full bg-white rounded-lg shadow-md">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="font-semibold">Marking Panel</h2>
          </div>

          <div className="p-4">
            {/* Question Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={currentQuestion.question_number}
                onChange={(e) => handleQuestionChange(e.target.value)}
              >
                {assessment.questions.map((question) => (
                  <option key={question.question_number} value={question.question_number}>
                    Question {question.question_number} ({question.max_marks} marks)
                  </option>
                ))}
              </select>
            </div>

            {/* Marks Input for Current Question */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Marks</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-12 text-sm font-medium">Marks</span>
                  <div className="flex-1 flex items-center">
                    <input
                      type="number"
                      min="0"
                      max={currentQuestion.max_marks}
                      step="0.5"
                      value={currentQuestion.awarded_marks || 0}
                      onChange={(e) =>
                        handleMarkChange(
                          currentQuestion.question_number,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center"
                    />
                    <span className="mx-2 text-sm text-gray-500">
                      / {currentQuestion.max_marks}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Marks Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">
                  Total for Question {currentQuestion.question_number}
                </span>
                <span className="font-medium">
                  {currentQuestion.awarded_marks || 0} / {currentQuestion.max_marks}
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Overall Total</span>
                <span className="font-medium">
                  {assessment.questions.reduce(
                    (sum, question) => sum + (question.awarded_marks || 0),
                    0
                  )} / {assessment.total_marks}
                </span>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {saving ? (
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