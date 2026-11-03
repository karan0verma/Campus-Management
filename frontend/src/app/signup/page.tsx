'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  GraduationCap,
  Wrench,
  ShieldCheck,
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  BookOpen,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<'student' | 'technician' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleConfigs = {
    student: {
      title: 'Student Registration',
      subtitle: 'Create a student account to explore campus infrastructure & file maintenance complaints.',
      icon: GraduationCap,
      color: 'blue',
      badge: 'Public Access',
      usernameLabel: 'Roll Number / Student ID',
      usernamePlaceholder: 'e.g. 21CS042 or rahul',
      deptLabel: 'Branch / Department',
      deptPlaceholder: 'e.g. Computer Science, Mechanical Engineering',
      targetDashboard: '/student/dashboard',
    },
    technician: {
      title: 'Technician Staff Registration',
      subtitle: 'Register as college maintenance staff to view assigned tickets and update repair status.',
      icon: Wrench,
      color: 'amber',
      badge: 'Staff Passkey Required',
      usernameLabel: 'Staff ID / Technician Username',
      usernamePlaceholder: 'e.g. tech_rajesh or ELEC_04',
      deptLabel: 'Specialization / Trade',
      deptPlaceholder: 'e.g. Electrical, HVAC & AC, Computer Lab Hardware',
      targetDashboard: '/technician/dashboard',
    },
    admin: {
      title: 'College Administrator Registration',
      subtitle: 'Register as an administrator to manage physical infrastructure, equipment & dispatch tickets.',
      icon: ShieldCheck,
      color: 'purple',
      badge: 'Master Admin Key Required',
      usernameLabel: 'Administrator Username',
      usernamePlaceholder: 'e.g. admin_office or head_infra',
      deptLabel: 'Office / Administration Wing',
      deptPlaceholder: 'e.g. Estate Office, IT Infrastructure Directorate',
      targetDashboard: '/admin/dashboard',
    },
  };

  const activeConfig = roleConfigs[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if ((role === 'admin' || role === 'technician') && !securityKey.trim()) {
      setError(`Please enter the required authorization passkey for ${role} registration.`);
      setLoading(false);
      return;
    }

    try {
      await api.register({
        username: username.trim(),
        password: password,
        role: role,
        security_key: securityKey.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim() || (role === 'student' ? 'General Student' : (role === 'technician' ? 'Maintenance' : 'Administration')),
      });

      // Automatically sign in
      const loggedInUser = await login({ username: username.trim(), password });

      // Navigate to corresponding dashboard
      if (loggedInUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (loggedInUser.role === 'technician') {
        router.push('/technician/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your credentials or passkey.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className={`inline-flex w-14 h-14 rounded-2xl items-center justify-center text-white shadow-lg mb-3 ${
          role === 'admin'
            ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/30'
            : role === 'technician'
            ? 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-500/30'
            : 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/30'
        }`}>
          <activeConfig.icon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{activeConfig.title}</h1>
        <p className="mt-1 text-sm text-slate-300 max-w-md mx-auto">
          {activeConfig.subtitle}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role / Account Type
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setRole('student'); setError(null); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  role === 'student'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-1" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('technician'); setError(null); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  role === 'technician'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Wrench className="w-4 h-4 mb-1" />
                <span>Technician</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('admin'); setError(null); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mb-1" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Role Status Note */}
          {role === 'student' && (
            <div className="mb-5 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-blue-600" />
              <span>
                Students can sign up freely with their Roll Number or College ID to report faulty equipment.
              </span>
            </div>
          )}

          {role === 'technician' && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 shrink-0 text-amber-700" />
              <div>
                <p className="font-semibold">Technician Authorization Required</p>
                <p className="text-amber-800/90 text-[11px] mt-0.5">
                  To prevent unauthorized access, technicians need the secret passkey issued by the Head Administrator.
                </p>
              </div>
            </div>
          )}

          {role === 'admin' && (
            <div className="mb-5 p-3 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-xl flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-purple-700" />
              <div>
                <p className="font-semibold">Master Admin Passkey Required</p>
                <p className="text-purple-800/90 text-[11px] mt-0.5">
                  Administrator privileges require the Master College Admin Passkey for verification.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Conditional Security Passkey input for Technician and Admin */}
            {(role === 'admin' || role === 'technician') && (
              <div className="p-3.5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {role === 'admin' ? 'Master Admin Passkey' : 'Technician Authorization Key'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={securityKey}
                    onChange={(e) => setSecurityKey(e.target.value)}
                    placeholder={role === 'admin' ? 'Enter Master Admin Passkey' : 'Enter Technician Passkey'}
                    className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Contact the college master admin if you do not have this security key.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {activeConfig.usernameLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={activeConfig.usernamePlaceholder}
                    className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={4}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rajesh"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Kumar"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@college.edu"
                    className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeConfig.deptLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder={activeConfig.deptPlaceholder}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-3 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                role === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'
                  : role === 'technician'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Register as {role.charAt(0).toUpperCase() + role.slice(1)} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Sign In here
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          CampusOps • College Infrastructure & Maintenance System
        </p>
      </div>
    </div>
  );
}
