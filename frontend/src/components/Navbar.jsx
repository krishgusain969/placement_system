import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Layers,
  GraduationCap,
  Cpu,
  BarChart3,
  FileCheck2,
  PlusCircle,
  LogOut,
  UserCheck,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
              NextPlace
            </span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </Link>
        </div>
      </nav>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                  NextPlace
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {isAdmin ? 'Admin' : 'Student'}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Admin Exclusive Portal Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive('/admin')
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-purple-300 hover:text-white hover:bg-purple-900/30 border border-purple-500/30'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Admin Portal
              </Link>
            )}

            <Link
              to="/jobs"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/jobs')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Jobs Board
            </Link>

            <Link
              to="/applications"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/applications')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              {isAdmin ? 'All Applications' : 'My Applications'}
            </Link>

            {isAdmin && (
              <Link
                to="/students"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/students')
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Students
              </Link>
            )}

            {/* OS Lab Special Feature */}
            <Link
              to="/oslab"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                isActive('/oslab')
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25 ring-2 ring-purple-400/30'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/30 border border-purple-500/30'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              OS Lab Sim
            </Link>
          </div>

          {/* Quick Role Switcher & User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              <span className="text-slate-500 px-2">Role:</span>
              <button
                onClick={() => switchRole('student')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user.role === 'student'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => switchRole('admin')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user.role === 'admin'
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                TPO Admin
              </button>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-blue-400">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {user.role === 'admin' ? 'TPO Admin' : 'Student'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 ml-1 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
