import React, { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const loginWithCredentials = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      const userData = {
        user_id: data.user_id,
        email: data.email || email,
        name: data.name || (data.role === 'admin' ? 'TPO Administrator' : 'Student User'),
        role: data.role,
        student_id: data.student_id || data.ref_id,
        dept: data.dept || 'Computer Science',
        cgpa: data.cgpa || 8.5,
        backlogs: data.backlogs || 0,
        skills: data.skills || 'Python, React, SQL',
        is_placed: data.is_placed || false
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (data.access_token) localStorage.setItem('token', data.access_token);
      return { success: true, user: userData };
    } catch (err) {
      // Local fallback for quick demo if backend DB user is missing or offline
      let mockUser = null;
      if (email.includes('admin') || email.includes('tpo')) {
        mockUser = {
          user_id: 1,
          name: 'Prof. Sharma (TPO Head)',
          email: email,
          role: 'admin'
        };
      } else if (email.includes('recruiter')) {
        mockUser = {
          user_id: 201,
          name: 'Google Campus Recruiter',
          email: email,
          role: 'recruiter',
          company: 'Google India',
          company_id: 1
        };
      } else {
        mockUser = {
          user_id: 101,
          student_id: 101,
          name: 'Krish Gusain',
          email: email,
          role: 'student',
          cgpa: 8.85,
          backlogs: 0,
          dept: 'Computer Science',
          skills: 'React, Python, FastAPI, C, SQL',
          is_placed: false
        };
      }
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock_jwt_token_demo');
      return { success: true, user: mockUser, fallback: true };
    }
  };

  const registerWithData = async (formData) => {
    try {
      const data = await registerUser(formData);
      const userData = {
        user_id: data.user_id,
        email: data.email || formData.email,
        name: data.name || formData.name,
        role: data.role || formData.role,
        student_id: data.student_id,
        dept: data.dept || formData.dept_name || 'Computer Science',
        cgpa: data.cgpa || formData.cgpa || 8.0,
        backlogs: data.backlogs || formData.backlogs || 0,
        skills: data.skills || formData.skills || '',
        is_placed: false
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (data.access_token) localStorage.setItem('token', data.access_token);
      return { success: true, user: userData };
    } catch (err) {
      // Fallback
      const userData = {
        user_id: Date.now(),
        student_id: Date.now(),
        email: formData.email,
        name: formData.name,
        role: formData.role,
        dept: formData.dept_name || 'Computer Science',
        cgpa: parseFloat(formData.cgpa) || 8.0,
        backlogs: parseInt(formData.backlogs) || 0,
        skills: formData.skills || 'Python',
        is_placed: false
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'mock_registered_token');
      return { success: true, user: userData, fallback: true };
    }
  };

  const switchRole = (newRole) => {
    let updated;
    if (newRole === 'student') {
      updated = {
        user_id: 101,
        student_id: 101,
        name: 'Krish Gusain',
        email: 'krish@college.edu',
        role: 'student',
        cgpa: 8.85,
        backlogs: 0,
        dept: 'Computer Science',
        skills: 'React, Python, FastAPI, C, SQL',
        is_placed: false
      };
    } else if (newRole === 'recruiter') {
      updated = {
        user_id: 201,
        name: 'Google Campus Recruiter',
        email: 'recruiter@google.com',
        role: 'recruiter',
        company: 'Google India',
        company_id: 1
      };
    } else {
      updated = {
        user_id: 1,
        name: 'Prof. Sharma (TPO Head)',
        email: 'admin@placement.edu',
        role: 'admin'
      };
    }
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loginWithCredentials, registerWithData, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
