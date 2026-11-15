import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock database for instant testing & fallback
export const mockData = {
  jobs: [
    {
      job_id: 1,
      company_id: 1,
      company_name: 'Google India',
      title: 'Software Development Engineer',
      package_lpa: 32.5,
      min_cgpa: 8.5,
      max_backlogs: 0,
      deadline: '2026-11-15',
      tier: 'DREAM',
      eligible_depts: ['Computer Science', 'Information Tech', 'Electronics']
    },
    {
      job_id: 2,
      company_id: 2,
      company_name: 'Microsoft',
      title: 'Cloud Solutions Associate',
      package_lpa: 24.0,
      min_cgpa: 8.0,
      max_backlogs: 0,
      deadline: '2026-11-20',
      tier: 'DREAM',
      eligible_depts: ['Computer Science', 'Information Tech']
    },
    {
      job_id: 3,
      company_id: 3,
      company_name: 'Goldman Sachs',
      title: 'Quantitative Analyst',
      package_lpa: 28.0,
      min_cgpa: 8.2,
      max_backlogs: 0,
      deadline: '2026-11-10',
      tier: 'DREAM',
      eligible_depts: ['Computer Science', 'Mathematics & Computing', 'Electronics']
    },
    {
      job_id: 4,
      company_id: 4,
      company_name: 'Cisco Systems',
      title: 'Network & Security Engineer',
      package_lpa: 14.5,
      min_cgpa: 7.0,
      max_backlogs: 1,
      deadline: '2026-12-05',
      tier: 'CORE',
      eligible_depts: ['Computer Science', 'Information Tech', 'Electronics', 'Electrical']
    },
    {
      job_id: 5,
      company_id: 5,
      company_name: 'Tata Consultancy Services',
      title: 'Digital Cadre Engineer',
      package_lpa: 7.5,
      min_cgpa: 6.5,
      max_backlogs: 2,
      deadline: '2026-12-15',
      tier: 'MASS',
      eligible_depts: ['All Departments']
    }
  ],
  students: [
    { student_id: 101, name: 'Krish Gusain', email: 'krish@college.edu', dept: 'Computer Science', cgpa: 8.85, backlogs: 0, is_placed: false, skills: 'React, Python, FastApi, C, SQL' },
    { student_id: 102, name: 'Ananya Sharma', email: 'ananya@college.edu', dept: 'Information Tech', cgpa: 9.12, backlogs: 0, is_placed: true, skills: 'Java, Spring Boot, AWS, Docker' },
    { student_id: 103, name: 'Rohan Verma', email: 'rohan@college.edu', dept: 'Electronics', cgpa: 7.45, backlogs: 1, is_placed: false, skills: 'C++, Embedded Systems, IoT' },
    { student_id: 104, name: 'Pooja Iyer', email: 'pooja@college.edu', dept: 'Computer Science', cgpa: 8.40, backlogs: 0, is_placed: true, skills: 'Python, ML, PyTorch, SQL' },
    { student_id: 105, name: 'Aryan Mehta', email: 'aryan@college.edu', dept: 'Mechanical', cgpa: 6.90, backlogs: 2, is_placed: false, skills: 'AutoCAD, SolidWorks, Python' }
  ],
  applications: [
    { app_id: 1, student_id: 101, student_name: 'Krish Gusain', job_id: 1, company: 'Google India', role: 'Software Development Engineer', package_lpa: 32.5, status: 'INTERVIEWED', applied_at: '2026-10-02' },
    { app_id: 2, student_id: 101, student_name: 'Krish Gusain', job_id: 2, company: 'Microsoft', role: 'Cloud Solutions Associate', package_lpa: 24.0, status: 'SHORTLISTED', applied_at: '2026-10-05' },
    { app_id: 3, student_id: 102, student_name: 'Ananya Sharma', job_id: 3, company: 'Goldman Sachs', role: 'Quantitative Analyst', package_lpa: 28.0, status: 'SELECTED', applied_at: '2026-09-28' },
    { app_id: 4, student_id: 103, student_name: 'Rohan Verma', job_id: 4, company: 'Cisco Systems', role: 'Network & Security Engineer', package_lpa: 14.5, status: 'APPLIED', applied_at: '2026-10-12' }
  ],
  reports: {
    deptPlacement: [
      { department: 'Computer Science', total: 120, placed: 108, percentage: 90.0, avg_ctc: 18.4 },
      { department: 'Information Tech', total: 80, placed: 70, percentage: 87.5, avg_ctc: 15.2 },
      { department: 'Electronics', total: 95, placed: 72, percentage: 75.8, avg_ctc: 11.8 },
      { department: 'Electrical', total: 60, placed: 41, percentage: 68.3, avg_ctc: 8.9 },
      { department: 'Mechanical', total: 70, placed: 44, percentage: 62.8, avg_ctc: 7.2 }
    ],
    funnel: [
      { status: 'APPLIED', count: 480 },
      { status: 'SHORTLISTED', count: 260 },
      { status: 'INTERVIEWED', count: 140 },
      { status: 'SELECTED', count: 85 },
      { status: 'REJECTED', count: 195 }
    ],
    packageDistribution: [
      { bracket: 'Above 20 LPA', count: 28 },
      { bracket: '10-20 LPA', count: 62 },
      { bracket: '5-10 LPA', count: 145 },
      { bracket: 'Below 5 LPA', count: 32 }
    ]
  }
};

export const loginUser = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const fetchJobs = async () => {
  try {
    const res = await api.get('/jobs/');
    return res.data && res.data.length ? res.data : mockData.jobs;
  } catch (err) {
    return mockData.jobs;
  }
};

export const createJob = async (jobData) => {
  const res = await api.post('/jobs/', jobData);
  return res.data;
};

export const fetchApplications = async () => {
  try {
    const res = await api.get('/applications/');
    return res.data && res.data.length ? res.data : mockData.applications;
  } catch (err) {
    return mockData.applications;
  }
};

export const fetchStudentApplications = async (studentId) => {
  try {
    const res = await api.get(`/applications/student/${studentId}`);
    return res.data && res.data.length ? res.data : mockData.applications.filter(a => a.student_id === studentId);
  } catch (err) {
    return mockData.applications.filter(a => a.student_id === studentId);
  }
};

export const applyToJob = async (studentId, jobId) => {
  const res = await api.post('/applications/', {
    student_id: studentId,
    job_id: jobId
  });
  return res.data;
};

export const updateApplicationStatus = async (appId, status) => {
  const res = await api.patch(`/applications/${appId}/status`, { status });
  return res.data;
};

export const fetchStudents = async () => {
  try {
    const res = await api.get('/students/');
    return res.data && res.data.length ? res.data : mockData.students;
  } catch (err) {
    return mockData.students;
  }
};

export const addStudent = async (studentData) => {
  const res = await api.post('/students/', studentData);
  return res.data;
};

export const updateStudent = async (studentId, studentData) => {
  const res = await api.patch(`/students/${studentId}`, studentData);
  return res.data;
};

export const deleteStudent = async (studentId) => {
  const res = await api.delete(`/students/${studentId}`);
  return res.data;
};

export const fetchCompanies = async () => {
  try {
    const res = await api.get('/companies/');
    return res.data && res.data.length ? res.data : [
      { company_id: 1, name: 'Google India', sector: 'Software', tier: 'DREAM' },
      { company_id: 2, name: 'Microsoft', sector: 'Cloud & Enterprise', tier: 'DREAM' },
      { company_id: 3, name: 'Goldman Sachs', sector: 'Financial Tech', tier: 'DREAM' },
      { company_id: 4, name: 'Cisco Systems', sector: 'Networking', tier: 'NORMAL' },
      { company_id: 5, name: 'Tata Consultancy Services', sector: 'IT Services', tier: 'NORMAL' },
    ];
  } catch (err) {
    return [
      { company_id: 1, name: 'Google India', sector: 'Software', tier: 'DREAM' },
      { company_id: 2, name: 'Microsoft', sector: 'Cloud & Enterprise', tier: 'DREAM' },
      { company_id: 3, name: 'Goldman Sachs', sector: 'Financial Tech', tier: 'DREAM' },
      { company_id: 4, name: 'Cisco Systems', sector: 'Networking', tier: 'NORMAL' },
      { company_id: 5, name: 'Tata Consultancy Services', sector: 'IT Services', tier: 'NORMAL' },
    ];
  }
};

export const addCompany = async (companyData) => {
  const res = await api.post('/companies/', companyData);
  return res.data;
};

export const updateCompany = async (companyId, companyData) => {
  const res = await api.put(`/companies/${companyId}`, companyData);
  return res.data;
};

export const deleteCompany = async (companyId) => {
  const res = await api.delete(`/companies/${companyId}`);
  return res.data;
};

export const fetchReports = async () => {
  try {
    const [dept, funnel, dist] = await Promise.all([
      api.get('/reports/department'),
      api.get('/reports/funnel'),
      api.get('/reports/package-distribution')
    ]);
    return {
      deptPlacement: dept.data,
      funnel: funnel.data,
      packageDistribution: dist.data
    };
  } catch (err) {
    return mockData.reports;
  }
};

export default api;
