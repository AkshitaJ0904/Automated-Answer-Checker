import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "../types";
import { authService } from "../components/services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null; // Add role to the context
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null); // Add role state

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role'); // Retrieve role from localStorage
    if (token && storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setRole(parsedUser.role); // Set role from the user object
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.token) {
        throw new Error('No token received');
      }

      // Store token in localStorage
      localStorage.setItem('token', response.token);

      // Create user object
      const user: User = {
        id: response.userId || '1', // Use actual user ID from response
        username: email.split('@')[0], // Default username from email
        email,
        role: response.role || 'user', // Default role if not provided
      };

      // Store user and role in localStorage
      setUser(user);
      setRole(user.role);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role); // Store role in localStorage
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.signup(email, password);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.token) {
        throw new Error('No token received');
      }

      // Store token in localStorage
      localStorage.setItem('token', response.token);

      // Create user object
      const user: User = {
        id: response.userId || '1', // Use actual user ID from response
        username,
        email,
        role: response.role || 'user', // Default role if not provided
      };

      // Store user and role in localStorage
      setUser(user);
      setRole(user.role);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role); // Store role in localStorage
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setRole(null); // Clear role on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role'); // Remove role from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};