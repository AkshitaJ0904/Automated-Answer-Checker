export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface Question {
  question_number: string;
  max_marks: number;
  awarded_marks: number;
}

export interface Assessment {
  studentAnswerSheets: any;
  exam_name: string;
  questions: Question[];
  total_marks: number;
  candidate_id: string;
}

export interface DashboardAssessment {
  id: string;
  examName: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  totalQuestions: number;
}

export interface StudentResult {
  candidateKey: string;
  totalMarks: number;
}