import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  Award,
  Filter,
  UserCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterPlaced, setFilterPlaced] = useState('ALL');

  useEffect(() => {
    async function loadStudents() {
      const data = await fetchStudents();
      setStudents(data);
    }
    loadStudents();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Student Data Privacy Protection</h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            The college student talent directory is accessible exclusively to verified Training &amp; Placement Officers (TPO Admins). As a student, you have access to your personal database profile and job applications.
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            Go to My Applications <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-all"
          >
            My Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.skills?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'ALL' || s.dept === filterDept;
    const matchesPlaced =
      filterPlaced === 'ALL' ||
      (filterPlaced === 'PLACED' && s.is_placed) ||
      (filterPlaced === 'UNPLACED' && !s.is_placed);

    return matchesSearch && matchesDept && matchesPlaced;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Talent Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered graduating engineers, CGPA rankings, and placement status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Tech">Information Tech</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
          </select>

          <select
            value={filterPlaced}
            onChange={(e) => setFilterPlaced(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PLACED">Placed Only</option>
            <option value="UNPLACED">Unplaced Only</option>
          </select>
        </div>
      </div>

      {/* Students Table / Grid */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Student Info</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Academic Metrics</th>
                <th className="py-3.5 px-6">Tech Skills</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((s) => (
                <tr key={s.student_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {s.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-300 font-medium">
                    {s.dept}
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-white text-base">{s.cgpa}</span>
                      <span className="text-xs text-slate-400">CGPA</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {s.backlogs === 0 ? (
                        <span className="text-emerald-400 font-medium">0 Backlogs</span>
                      ) : (
                        <span className="text-amber-400 font-medium">{s.backlogs} Backlogs</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {s.skills?.split(',').map((skill, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {s.is_placed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Placed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <UserCheck className="w-3.5 h-3.5" /> Available
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
