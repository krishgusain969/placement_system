import React, { useState, useEffect } from 'react';
import {
  fetchCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
  fetchStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  fetchJobs,
  createJob,
  fetchApplications,
  updateApplicationStatus
} from '../services/api';
import {
  Building2,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldAlert,
  X,
  Layers,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('companies'); // 'companies' | 'students' | 'jobs' | 'applications'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Data states
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');


  // Modals state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', sector: '', tier: 'NORMAL' });

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    dept_name: 'Computer Science & Engineering',
    cgpa: 8.5,
    backlogs: 0,
    skills: '',
    password: 'password123'
  });

  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    company_id: 1,
    title: '',
    package_lpa: 12.0,
    min_cgpa: 7.5,
    max_backlogs: 0,
    deadline: '2026-12-31',
    tier: 'NORMAL',
    eligible_depts: [1]
  });

  // Filter/search
  const [studentSearch, setStudentSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [comps, studs, jbs, apps] = await Promise.all([
        fetchCompanies(),
        fetchStudents(),
        fetchJobs(),
        fetchApplications()
      ]);
      setCompanies(comps);
      setStudents(studs);
      setJobs(jbs);
      setApplications(apps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // --- COMPANY HANDLERS ---
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.company_id, companyForm);
        showNotification(`Company "${companyForm.name}" updated successfully!`);
      } else {
        await addCompany(companyForm);
        showNotification(`Company "${companyForm.name}" added successfully!`);
      }
      setShowCompanyModal(false);
      setEditingCompany(null);
      setCompanyForm({ name: '', sector: '', tier: 'NORMAL' });
      const comps = await fetchCompanies();
      setCompanies(comps);
    } catch (err) {
      showNotification('Failed to save company details.', 'error');
    }
  };

  const handleDeleteCompany = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete company "${name}"?`)) return;
    try {
      await deleteCompany(id);
      showNotification(`Company "${name}" deleted.`);
      setCompanies(companies.filter((c) => c.company_id !== id));
    } catch (err) {
      showNotification('Failed to delete company.', 'error');
    }
  };

  // --- STUDENT HANDLERS ---
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.student_id, {
          name: studentForm.name,
          cgpa: parseFloat(studentForm.cgpa),
          backlogs: parseInt(studentForm.backlogs),
          skills: studentForm.skills
        });
        showNotification(`Student "${studentForm.name}" updated successfully!`);
      } else {
        await addStudent({
          ...studentForm,
          cgpa: parseFloat(studentForm.cgpa),
          backlogs: parseInt(studentForm.backlogs)
        });
        showNotification(`Student "${studentForm.name}" registered successfully!`);
      }
      setShowStudentModal(false);
      setEditingStudent(null);
      setStudentForm({
        name: '',
        email: '',
        dept_name: 'Computer Science & Engineering',
        cgpa: 8.5,
        backlogs: 0,
        skills: '',
        password: 'password123'
      });
      const studs = await fetchStudents();
      setStudents(studs);
    } catch (err) {
      showNotification('Failed to save student profile.', 'error');
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"?`)) return;
    try {
      await deleteStudent(id);
      showNotification(`Student "${name}" deleted.`);
      setStudents(students.filter((s) => s.student_id !== id));
    } catch (err) {
      showNotification('Failed to delete student.', 'error');
    }
  };

  // --- JOB HANDLERS ---
  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      await createJob({
        ...jobForm,
        company_id: parseInt(jobForm.company_id),
        package_lpa: parseFloat(jobForm.package_lpa),
        min_cgpa: parseFloat(jobForm.min_cgpa),
        max_backlogs: parseInt(jobForm.max_backlogs)
      });
      showNotification(`Job opening "${jobForm.title}" posted successfully!`);
      setShowJobModal(false);
      setJobForm({
        company_id: 1,
        title: '',
        package_lpa: 12.0,
        min_cgpa: 7.5,
        max_backlogs: 0,
        deadline: '2026-12-31',
        tier: 'NORMAL',
        eligible_depts: [1]
      });
      const jbs = await fetchJobs();
      setJobs(jbs);
    } catch (err) {
      showNotification('Failed to post new job.', 'error');
    }
  };

  // --- APPLICATION STATUS HANDLER ---
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      showNotification(`Application #${appId} status updated to ${newStatus}`);
      setApplications(
        applications.map((a) => (a.app_id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      showNotification('Failed to update status.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> TPO Administration Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Placement Management &amp; Enterprise Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete authority to manage visiting companies, student talent pool, job drives, and application lifecycles
          </p>
        </div>

        {/* Global Action Stats */}
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Total Companies</div>
            <div className="text-lg font-bold text-white">{companies.length}</div>
          </div>
          <div className="glass-card px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Total Students</div>
            <div className="text-lg font-bold text-purple-400">{students.length}</div>
          </div>
          <div className="glass-card px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Active Applications</div>
            <div className="text-lg font-bold text-emerald-400">{applications.length}</div>
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
            message.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {message.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {message.text}
          </div>
          <button onClick={() => setMessage({ text: '', type: '' })}>
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'companies'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Manage Companies ({companies.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'students'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Manage Students ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'jobs'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Job Openings ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'applications'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          All Applications ({applications.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. COMPANIES TAB */}
      {/* ======================================================== */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search companies by name or sector..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => {
                setEditingCompany(null);
                setCompanyForm({ name: '', sector: '', tier: 'NORMAL' });
                setShowCompanyModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Company
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
                  (c.sector && c.sector.toLowerCase().includes(companySearch.toLowerCase()))
              )
              .map((comp) => (
                <div
                  key={comp.company_id}
                  className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-purple-400 border border-slate-700">
                        {comp.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{comp.name}</h3>
                        <p className="text-xs text-slate-400">{comp.sector || 'Industry Partner'}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        comp.tier === 'DREAM'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : comp.tier === 'SUPER_DREAM'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {comp.tier}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-500">ID #{comp.company_id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCompany(comp);
                          setCompanyForm({ name: comp.name, sector: comp.sector || '', tier: comp.tier || 'NORMAL' });
                          setShowCompanyModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Company"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(comp.company_id, comp.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. STUDENTS TAB */}
      {/* ======================================================== */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students by name, email, skills..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => {
                setEditingStudent(null);
                setStudentForm({
                  name: '',
                  email: '',
                  dept_name: 'Computer Science & Engineering',
                  cgpa: 8.5,
                  backlogs: 0,
                  skills: '',
                  password: 'password123'
                });
                setShowStudentModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">CGPA</th>
                    <th className="py-3.5 px-4">Backlogs</th>
                    <th className="py-3.5 px-4">Skills</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {students
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        (s.skills && s.skills.toLowerCase().includes(studentSearch.toLowerCase()))
                    )
                    .map((s) => (
                      <tr key={s.student_id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{s.dept_name || s.dept || 'Engineering'}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-400">{s.cgpa}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              s.backlogs === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {s.backlogs} Backlogs
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">{s.skills || 'None listed'}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              s.is_placed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {s.is_placed ? 'PLACED' : 'UNPLACED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingStudent(s);
                              setStudentForm({
                                name: s.name,
                                email: s.email,
                                dept_name: s.dept_name || s.dept || '',
                                cgpa: s.cgpa,
                                backlogs: s.backlogs,
                                skills: s.skills || '',
                                password: ''
                              });
                              setShowStudentModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.student_id, s.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. JOBS TAB */}
      {/* ======================================================== */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Active Recruitment Drives</h2>
            <button
              onClick={() => setShowJobModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      {job.company_name || 'Enterprise'}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-0.5">{job.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {job.package_lpa} LPA
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500">Min CGPA:</span>{' '}
                    <span className="font-semibold text-slate-200">{job.min_cgpa}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Backlogs:</span>{' '}
                    <span className="font-semibold text-slate-200">{job.max_backlogs}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tier:</span>{' '}
                    <span className="font-semibold text-purple-300">{job.tier}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Deadline:</span>{' '}
                    <span className="font-semibold text-slate-200">{job.deadline || 'Rolling'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. APPLICATIONS & RECRUITMENT FUNNEL TAB */}
      {/* ======================================================== */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" /> Recruitment Pipeline Funnel &amp; Applications
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Filter and inspect full student academic profiles across recruitment pipeline stages
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Total: {applications.length} Student Applications
            </div>
          </div>

          {/* Interactive Pipeline Funnel Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'ALL', color: 'border-slate-700 bg-slate-900/60 text-slate-300', count: applications.length },
              { label: 'APPLIED', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300', count: applications.filter(a => a.status === 'APPLIED').length },
              { label: 'SHORTLISTED', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300', count: applications.filter(a => a.status === 'SHORTLISTED').length },
              { label: 'INTERVIEWED', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300', count: applications.filter(a => a.status === 'INTERVIEWED').length },
              { label: 'SELECTED', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', count: applications.filter(a => a.status === 'SELECTED').length },
              { label: 'REJECTED', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300', count: applications.filter(a => a.status === 'REJECTED').length },
            ].map(stage => {
              const isActive = (appStatusFilter || 'ALL') === stage.label;
              return (
                <button
                  key={stage.label}
                  onClick={() => setAppStatusFilter(stage.label === 'ALL' ? '' : stage.label)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20 ' + stage.color
                      : 'hover:border-slate-600 bg-slate-900/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider">{stage.label}</div>
                  <div className="text-xl font-extrabold text-white mt-1">{stage.count}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {Math.round((stage.count / Math.max(applications.length, 1)) * 100)}% of total
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidate name, email, department, or company..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            {appStatusFilter && (
              <button
                onClick={() => setAppStatusFilter('')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded-lg bg-purple-500/10"
              >
                Clear Stage Filter ({appStatusFilter})
              </button>
            )}
          </div>

          {/* Comprehensive Applications & Student Profile Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">App ID</th>
                    <th className="py-3.5 px-4">Candidate Profile</th>
                    <th className="py-3.5 px-4">Academic Details</th>
                    <th className="py-3.5 px-4">Technical Skills</th>
                    <th className="py-3.5 px-4">Applied Job &amp; Recruiter</th>
                    <th className="py-3.5 px-4">Package</th>
                    <th className="py-3.5 px-4">Funnel Status</th>
                    <th className="py-3.5 px-4 text-right">Promote / Change Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {applications
                    .filter(app => {
                      const matchesStatus = !appStatusFilter || app.status === appStatusFilter;
                      const q = (appSearch || '').toLowerCase();
                      const matchesSearch =
                        !q ||
                        (app.student_name || '').toLowerCase().includes(q) ||
                        (app.student_email || '').toLowerCase().includes(q) ||
                        (app.department || '').toLowerCase().includes(q) ||
                        (app.company_name || '').toLowerCase().includes(q) ||
                        (app.job_title || '').toLowerCase().includes(q);
                      return matchesStatus && matchesSearch;
                    })
                    .map((app) => (
                      <tr key={app.app_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">#{app.app_id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{app.student_name || `Student #${app.student_id}`}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{app.student_email || 'No email registered'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{app.department || 'Engineering'}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>CGPA: <strong className="text-emerald-400">{app.cgpa ?? '8.0'}</strong></span>
                            <span>•</span>
                            <span>Backlogs: <strong className={app.backlogs > 0 ? 'text-rose-400' : 'text-slate-300'}>{app.backlogs ?? 0}</strong></span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <div className="truncate text-slate-400 text-[11px]" title={app.skills || 'None'}>
                            {app.skills || 'General Tech'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{app.job_title || 'Software Role'}</div>
                          <div className="text-[11px] text-purple-400 font-semibold">{app.company_name || 'Enterprise'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">
                          {app.package_lpa ? `${app.package_lpa} LPA` : '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] border tracking-wider ${
                              app.status === 'SELECTED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                                : app.status === 'SHORTLISTED'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : app.status === 'INTERVIEWED'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : app.status === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.app_id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                          >
                            <option value="APPLIED">APPLIED</option>
                            <option value="SHORTLISTED">SHORTLISTED</option>
                            <option value="INTERVIEWED">INTERVIEWED</option>
                            <option value="SELECTED">SELECTED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT COMPANY */}
      {/* ======================================================== */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingCompany ? 'Edit Company Profile' : 'Add New Partner Company'}
              </h3>
              <button
                onClick={() => setShowCompanyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google India, Amazon, Infosys"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Software, Cloud &amp; AI, FinTech, Automotive"
                  value={companyForm.sector}
                  onChange={(e) => setCompanyForm({ ...companyForm, sector: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Placement Tier</label>
                <select
                  value={companyForm.tier}
                  onChange={(e) => setCompanyForm({ ...companyForm, tier: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="NORMAL">NORMAL (&lt; 10 LPA)</option>
                  <option value="SUPER_DREAM">SUPER_DREAM (10 - 18 LPA)</option>
                  <option value="DREAM">DREAM (18+ LPA)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                >
                  {editingCompany ? 'Save Changes' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT STUDENT */}
      {/* ======================================================== */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingStudent ? 'Edit Student Details' : 'Register New Student in System'}
              </h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingStudent}
                    placeholder="student@college.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={studentForm.dept_name}
                  onChange={(e) => setStudentForm({ ...studentForm, dept_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication Engineering">Electronics &amp; Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">CGPA (0 - 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={studentForm.cgpa}
                    onChange={(e) => setStudentForm({ ...studentForm, cgpa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Backlogs Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={studentForm.backlogs}
                    onChange={(e) => setStudentForm({ ...studentForm, backlogs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python, C++, Docker"
                  value={studentForm.skills}
                  onChange={(e) => setStudentForm({ ...studentForm, skills: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {!editingStudent && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Default Login Password</label>
                  <input
                    type="text"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                >
                  {editingStudent ? 'Update Profile' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD JOB */}
      {/* ======================================================== */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Post New Campus Drive</h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Company</label>
                <select
                  value={jobForm.company_id}
                  onChange={(e) => setJobForm({ ...jobForm, company_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Job Title / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Development Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={jobForm.package_lpa}
                    onChange={(e) => setJobForm({ ...jobForm, package_lpa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Min CGPA Required</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={jobForm.min_cgpa}
                    onChange={(e) => setJobForm({ ...jobForm, min_cgpa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Backlogs Allowed</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={jobForm.max_backlogs}
                    onChange={(e) => setJobForm({ ...jobForm, max_backlogs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Placement Tier</label>
                  <select
                    value={jobForm.tier}
                    onChange={(e) => setJobForm({ ...jobForm, tier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="SUPER_DREAM">SUPER_DREAM</option>
                    <option value="DREAM">DREAM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Application Deadline</label>
                <input
                  type="date"
                  required
                  value={jobForm.deadline}
                  onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                >
                  Publish Job Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
