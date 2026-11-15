import React, { useState, useEffect } from 'react';
import { fetchJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  IndianRupee,
  Briefcase,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [appliedJobs, setAppliedJobs] = useState(new Set([1, 2]));
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function loadJobs() {
      const data = await fetchJobs();
      setJobs(data);
    }
    loadJobs();
  }, []);

  const checkEligibility = (job) => {
    if (!user || user.role !== 'student') return { eligible: true, reasons: [] };

    const reasons = [];
    const studentCgpa = user.cgpa || 8.0;
    const studentBacklogs = user.backlogs || 0;

    if (studentCgpa < job.min_cgpa) {
      reasons.push(`CGPA ${studentCgpa} is below required ${job.min_cgpa}`);
    }
    if (studentBacklogs > job.max_backlogs) {
      reasons.push(`Backlogs (${studentBacklogs}) exceed maximum allowed (${job.max_backlogs})`);
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  };

  const handleApply = (job) => {
    const eligibility = checkEligibility(job);
    if (!eligibility.eligible) {
      setToastMessage({
        type: 'error',
        text: `Application Blocked: ${eligibility.reasons.join(', ')}`
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setAppliedJobs((prev) => new Set([...prev, job.job_id]));
    setToastMessage({
      type: 'success',
      text: `Successfully applied to ${job.company_name} for ${job.title}!`
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'ALL' || job.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/90 border-red-500/40 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Campus Recruitment Drives</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse corporate vacancies with automatic SQL-level eligibility evaluation
          </p>
        </div>

        {/* Search & Tier Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search companies or roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'DREAM', 'CORE', 'MASS'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedTier === tier
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student Eligibility Profile Indicator */}
      {user?.role === 'student' && (
        <div className="glass-card p-4 rounded-2xl border border-blue-500/20 bg-blue-950/20 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400">Evaluating eligibility for: </span>
              <strong className="text-white font-semibold">{user.name}</strong>
              <span className="text-slate-400"> ({user.dept})</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Your CGPA: </span>
              <strong className="text-emerald-400 font-bold text-sm">{user.cgpa}</strong>
            </div>
            <div>
              <span className="text-slate-400">Active Backlogs: </span>
              <strong className="text-slate-200 font-bold">{user.backlogs}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Job Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => {
          const { eligible, reasons } = checkEligibility(job);
          const hasApplied = appliedJobs.has(job.job_id);

          let tierBadgeStyle = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
          if (job.tier === 'DREAM') tierBadgeStyle = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
          if (job.tier === 'CORE') tierBadgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

          return (
            <div
              key={job.job_id}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between gap-5 relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" /> {job.company_name}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 leading-snug">{job.title}</h3>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${tierBadgeStyle}`}>
                    {job.tier}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 text-2xl font-black text-emerald-400">
                  <span>{job.package_lpa}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase">LPA CTC</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-3 border-y border-slate-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-500">Min CGPA</span>
                    <div className="font-semibold text-slate-200">{job.min_cgpa}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-500">Max Backlogs</span>
                    <div className="font-semibold text-slate-200">{job.max_backlogs} allowed</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-500">Deadline</span>
                    <div className="font-semibold text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {job.deadline || 'Nov 30, 2026'}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-500">Target Depts</span>
                    <div className="font-semibold text-slate-200 truncate">CS / IT / ECE</div>
                  </div>
                </div>

                {/* Eligibility Status Notice */}
                {user?.role === 'student' && (
                  <div>
                    {eligible ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Eligible for this drive
                      </div>
                    ) : (
                      <div className="text-[11px] text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-500/20">
                        <div className="flex items-center gap-1 font-semibold mb-0.5">
                          <XCircle className="w-3 h-3" /> Ineligible
                        </div>
                        {reasons.map((r, i) => (
                          <div key={i}>{r}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button: Only students apply; Admins manage */}
              <div>
                {user?.role === 'admin' ? (
                  <div className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Drive Active (Admin View)
                  </div>
                ) : hasApplied ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Already Applied
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(job)}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                      eligible
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
