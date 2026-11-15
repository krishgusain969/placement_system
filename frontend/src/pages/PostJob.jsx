import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Calendar, IndianRupee, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company_name: 'Google India',
    package_lpa: '',
    min_cgpa: '',
    max_backlogs: '0',
    deadline: '',
    tier: 'DREAM',
    eligible_depts: ['Computer Science', 'Information Tech']
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/jobs');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-2">
            <Briefcase className="w-3.5 h-3.5" /> Corporate Recruiter Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Post New Campus Drive</h1>
          <p className="text-xs text-slate-400 mt-1">
            Specify job role requirements, CTC, CGPA criteria, and department eligibility
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Job Drive Successfully Published!</h3>
            <p className="text-xs text-slate-400">Redirecting to jobs board...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Google India"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Title / Role</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. SDE 1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Annual CTC (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.package_lpa}
                  onChange={(e) => setFormData({ ...formData, package_lpa: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 25.0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="DREAM">DREAM (Above 18 LPA)</option>
                  <option value="CORE">CORE (8 - 18 LPA)</option>
                  <option value="MASS">MASS (Below 8 LPA)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Minimum CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.min_cgpa}
                  onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 7.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Max Backlogs Allowed</label>
                <input
                  type="number"
                  required
                  value={formData.max_backlogs}
                  onChange={(e) => setFormData({ ...formData, max_backlogs: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Application Deadline</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all mt-4"
            >
              Publish Campus Recruitment Drive
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
