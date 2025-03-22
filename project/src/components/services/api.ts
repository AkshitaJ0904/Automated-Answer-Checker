import axios from 'axios';
import { Assessment, DashboardAssessment } from '../../types';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const assessmentService = {
  createAssessment: async (formData: FormData): Promise<{ assessmentId: string }> => {
    const response = await api.post('/assessments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAssessments: async (): Promise<DashboardAssessment[]> => {
    const response = await api.get('/assessments');
    return response.data;
  },

  getAssessment: async (id: string): Promise<Assessment> => {
    const response = await api.get(`/assessments/${id}`);
    return response.data;
  },

  getStudentEvaluation: async (assessmentId: string, candidateKey: string): Promise<Assessment> => {
    const response = await api.get(
      `/api/assessments/${assessmentId}/students/${candidateKey}/evaluation`
    );
    return response.data;
  },

  saveStudentEvaluation: async (
    assessmentId: string,
    candidateKey: string,
    data: { questions: any[] }
  ): Promise<any> => {
    const response = await api.put(
      `/api/assessments/${assessmentId}/students/${candidateKey}/evaluation`,
      data
    );
    return response.data;
  },

  uploadStudentAnswers: async (formData: FormData): Promise<any> => {
    const response = await api.post('/upload-student-answers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// src/components/services/api.ts

// Example: Define authService
const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  signup: async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
};

// Export authService
export { authService };

export default api;