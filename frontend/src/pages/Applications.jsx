import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApplications, updateApplicationStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Award,
  ChevronRight,
  TrendingUp,
  History,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

const STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEWED', 'SELECTED'];

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadApps() {
      const data = await fetchApplications();
      setApplications(data);
    }
    loadApps();
  }, []);

  const advanceStatus = async (appId, nextStatus) => {
    try {
      await updateApplicationStatus(appId, nextStatus);
    } catch (err) {
      console.warn('Backend sync failed, updating locally', err);
    }
    setApplications((prev) =>
      prev.map((app) =>
        app.app_id === appId ? { ...app, status: nextStatus } : app
      )
    );
  };

  const isStudent = user?.role === 'student';

  // Filter for student: only their applications!
  const myApplications = isStudent
    ? applications.filter(
        (app) =>
          app.student_id === user?.student_id ||
          app.student_id === user?.user_id ||
          app.student_name?.toLowerCase() === user?.name?.toLowerCase() ||
          // fallback for initial demo student
          (!app.student_id && user?.name === 'Krish Gusain') ||
          (user?.email === 'krish@college.edu' && app.student_id === 101) ||
          (user?.email === 'student@student.edu' && (app.student_id === 1 || app.student_id === 101))
      )
    : applications;

  const displayList = myApplications.filter((app) => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch =
      (app.role || app.job_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.company || app.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.student_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Personal Database Card (Shown only to student) */}
      {isStudent && (
        <div className="glass-card rounded-3xl p-6 border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/25 shrink-0">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Student ID #{user?.student_id || user?.user_id || 101}
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  {user?.dept || 'Computer Science & Engineering'} &bull; {user?.email}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(user?.skills || 'React, Python, SQL, C').split(',').map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-center">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">CGPA</div>
                <div className="text-lg font-black text-emerald-400">{user?.cgpa || '8.85'}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Backlogs</div>
                <div className="text-lg font-black text-blue-400">{user?.backlogs ?? 0}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Placement</div>
                <div className={`text-xs font-bold mt-1 ${user?.is_placed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {user?.is_placed ? 'PLACED' : 'ACTIVE'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isStudent ? 'My Applied Jobs & Recruitment Progress' : 'Candidate Applications Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isStudent
              ? 'Personal real-time application pipeline. Only companies and roles you have applied for are shown here.'
              : 'College-wide application oversight. Review, interview, and issue final selections.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by role or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEWED">Interviewed</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {displayList.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Applications Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isStudent
                ? "You haven't submitted any job applications yet or none match your filter."
                : 'No student applications match the specified filter criteria.'}
            </p>
          </div>
          {isStudent && (
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
            >
              Explore Available Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((app) => {
            const currentStageIndex = STAGES.indexOf(app.status);
            const isRejected = app.status === 'REJECTED';
            const companyName = app.company_name || app.company || 'Enterprise';
            const jobTitle = app.job_title || app.role || 'Software Engineer';

            return (
              <div
                key={app.app_id}
                className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6 hover:border-slate-700/80 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                      {companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{jobTitle}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          App #{app.app_id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" /> {companyName}
                        </span>
                        {!isStudent && (
                          <>
                            <span>•</span>
                            <span>Applicant: <strong className="text-white">{app.student_name}</strong></span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> Applied: {app.applied_at || 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-xs text-slate-400 font-medium">Package Offered</div>
                    <div className="text-xl font-black text-emerald-400">
                      {app.package_lpa ? `${app.package_lpa} LPA` : 'Competitive'}
                    </div>
                  </div>
                </div>

                {/* Visual Pipeline Stepper */}
                <div className="pt-2">
                  <div className="grid grid-cols-4 gap-2 relative">
                    {STAGES.map((stage, idx) => {
                      const isCompleted = !isRejected && currentStageIndex >= idx;
                      const isCurrent = !isRejected && currentStageIndex === idx;

                      let stepBg = 'bg-slate-800/60 text-slate-500 border-slate-700/60';
                      if (isCompleted) stepBg = 'bg-blue-600/20 text-blue-300 border-blue-500/40 font-semibold';
                      if (isCurrent && stage === 'SELECTED')
                        stepBg = 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 font-bold';

                      return (
                        <div key={stage} className={`p-3 rounded-xl border text-center transition-all ${stepBg}`}>
                          <div className="text-[10px] uppercase tracking-wider mb-0.5 font-bold">
                            Stage {idx + 1}
                          </div>
                          <div className="text-xs font-semibold truncate">{stage}</div>
                        </div>
                      );
                    })}
                  </div>
                  {isRejected && (
                    <div className="mt-3 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>Application marked as <strong>REJECTED</strong> during current stage</span>
                    </div>
                  )}
                </div>

                {/* Admin Quick Action Controls */}
                {!isStudent && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-medium">TPO Stage Controls:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => advanceStatus(app.app_id, 'SHORTLISTED')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => advanceStatus(app.app_id, 'INTERVIEWED')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                      >
                        Interview
                      </button>
                      <button
                        onClick={() => advanceStatus(app.app_id, 'SELECTED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                      >
                        Select &amp; Offer
                      </button>
                      <button
                        onClick={() => advanceStatus(app.app_id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
