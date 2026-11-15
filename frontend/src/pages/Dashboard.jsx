import React, { useState, useEffect } from 'react';
import { fetchReports, fetchJobs, fetchStudents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  FileText
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [repData, jobData] = await Promise.all([
          fetchReports(),
          fetchJobs(),
        ]);
        setReports(repData);
        setJobs(jobData);
        
        // Only load full student list if admin to respect privacy
        if (user?.role === 'admin') {
          const stuData = await fetchStudents();
          setStudents(stuData);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Dept bar chart data
  const deptData = {
    labels: reports?.deptPlacement?.map((d) => d.department) || [],
    datasets: [
      {
        label: 'Placement %',
        data: reports?.deptPlacement?.map((d) => d.percentage) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderRadius: 8,
      },
      {
        label: 'Avg CTC (LPA)',
        data: reports?.deptPlacement?.map((d) => d.avg_ctc) || [],
        backgroundColor: 'rgba(168, 85, 247, 0.75)',
        borderRadius: 8,
      }
    ]
  };

  // Package distribution doughnut chart data
  const packageData = {
    labels: reports?.packageDistribution?.map((p) => p.bracket) || [],
    datasets: [
      {
        data: reports?.packageDistribution?.map((p) => p.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(239, 68, 68, 0.85)'
        ],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Role-Aware Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Campus Drive 2026-27 Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {user?.role === 'admin'
                ? `Welcome, Administrator ${user?.name || ''}`
                : `Welcome, ${user?.name || 'Student'}`}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {user?.role === 'admin'
                ? 'Centralized Placement Operations & TPO Management Portal. Control companies, schedule drives, manage student databases, and analyze multi-core OS metrics.'
                : `Student Portal • Department: ${user?.dept || 'Computer Science'} • CGPA: ${user?.cgpa || '8.5'} • Placement Status: ${user?.is_placed ? 'Placed 🎉' : 'Active Candidate'}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'admin' ? (
              <>
                <Link
                  to="/admin"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Admin Console
                </Link>
                <Link
                  to="/post-job"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
                >
                  Post New Drive
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/applications"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> My Applications
                </Link>
                <Link
                  to="/jobs"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" /> Apply for Drives
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Rate</span>
            <div className="p-2.5 bg-blue-500/15 rounded-xl text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">82.4%</span>
            <span className="text-xs font-medium text-emerald-400">+5.2% YoY</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">335 placed out of 425 eligible</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Package</span>
            <div className="p-2.5 bg-purple-500/15 rounded-xl text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">32.5 LPA</span>
            <span className="text-xs font-medium text-purple-300">Google India</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Dream Tier Offer (SDE-1)</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average CTC</span>
            <div className="p-2.5 bg-emerald-500/15 rounded-xl text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">12.8 LPA</span>
            <span className="text-xs font-medium text-emerald-400">+1.4 LPA</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Across all engineering streams</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Recruiters</span>
            <div className="p-2.5 bg-amber-500/15 rounded-xl text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{jobs.length} Companies</span>
            <span className="text-xs font-medium text-blue-400">Drive In-Progress</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Tier 1 & Tier 2 recruiters</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dept Placement Bar Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Department Placement vs Avg CTC</h3>
              <p className="text-xs text-slate-400">Comparative performance across major disciplines</p>
            </div>
          </div>
          <div className="h-72">
            <Bar
              data={deptData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#94a3b8' } }
                },
                scales: {
                  x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                  y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }}
            />
          </div>
        </div>

        {/* Package Distribution Doughnut */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">CTC Distribution</h3>
            <p className="text-xs text-slate-400">Offers grouped by package tiers (LPA)</p>
          </div>
          <div className="h-56 my-2 flex items-center justify-center">
            <Doughnut
              data={packageData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } }
                }
              }}
            />
          </div>
          <div className="text-xs text-slate-400 text-center border-t border-slate-800/80 pt-3">
            Majority offers concentrated in 5-20 LPA bracket.
          </div>
        </div>
      </div>

      {/* Recruitment Funnel & Live Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Funnel Stages */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-2">Recruitment Pipeline Funnel</h3>
          <p className="text-xs text-slate-400 mb-6">Status breakdown across active student candidatures</p>
          <div className="space-y-4">
            {reports?.funnel?.map((item) => {
              const max = 480;
              const pct = Math.round((item.count / max) * 100);
              let barColor = 'bg-blue-500';
              if (item.status === 'SELECTED') barColor = 'bg-emerald-500';
              if (item.status === 'REJECTED') barColor = 'bg-red-500/80';
              if (item.status === 'INTERVIEWED') barColor = 'bg-purple-500';

              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.status}</span>
                    <span className="text-slate-400">{item.count} candidates</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Companies / Job Openings */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Featured Job Openings</h3>
              <p className="text-xs text-slate-400">Current active company recruitment drives</p>
            </div>
            <a href="/jobs" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
              View All ({jobs.length})
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.job_id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-100 text-sm leading-snug">{job.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {job.tier}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-400 mt-1">{job.company_name}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="font-extrabold text-emerald-400 text-sm">{job.package_lpa} LPA</span>
                  <span className="text-slate-400">Min CGPA: <strong className="text-slate-200">{job.min_cgpa}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
