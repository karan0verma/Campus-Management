'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Building2,
  LayoutDashboard,
  Layers,
  DoorOpen,
  Cpu,
  AlertCircle,
  PlusCircle,
  Users,
  LogOut,
  User as UserIcon,
  Wrench,
  GraduationCap,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === pathname) return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const renderNavLinks = () => {
    if (role === 'admin') {
      return (
        <>
          <Link href="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/admin/buildings" className={navLinkClass('/admin/buildings')}>
            <Building2 className="w-4 h-4" />
            Buildings
          </Link>
          <Link href="/admin/floors" className={navLinkClass('/admin/floors')}>
            <Layers className="w-4 h-4" />
            Floors
          </Link>
          <Link href="/admin/rooms" className={navLinkClass('/admin/rooms')}>
            <DoorOpen className="w-4 h-4" />
            Rooms & Labs
          </Link>
          <Link href="/admin/equipment" className={navLinkClass('/admin/equipment')}>
            <Cpu className="w-4 h-4" />
            Equipment
          </Link>
          <Link href="/admin/complaints" className={navLinkClass('/admin/complaints')}>
            <AlertCircle className="w-4 h-4" />
            All Complaints
          </Link>
          <Link href="/admin/users" className={navLinkClass('/admin/users')}>
            <Users className="w-4 h-4" />
            Users
          </Link>
        </>
      );
    }

    if (role === 'technician') {
      return (
        <>
          <Link href="/technician/dashboard" className={navLinkClass('/technician/dashboard')}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/technician/complaints" className={navLinkClass('/technician/complaints')}>
            <Wrench className="w-4 h-4" />
            Assigned Complaints
          </Link>
        </>
      );
    }

    // Student
    return (
      <>
        <Link href="/student/dashboard" className={navLinkClass('/student/dashboard')}>
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        <Link href="/student/layout" className={navLinkClass('/student/layout')}>
          <Building2 className="w-4 h-4" />
          College Layout
        </Link>
        <Link href="/student/complaints" className={navLinkClass('/student/complaints')}>
          <AlertCircle className="w-4 h-4" />
          My Complaints
        </Link>
        <Link
          href="/student/complaints/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Raise Complaint
        </Link>
      </>
    );
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        );
      case 'technician':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <Wrench className="w-3 h-3" />
            Technician
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <GraduationCap className="w-3 h-3" />
            Student
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-slate-900 tracking-tight">CampusOps</span>
                    {getRoleBadge()}
                  </div>
                  <p className="text-[10px] text-slate-500 hidden sm:block">Infrastructure & Maintenance</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {renderNavLinks()}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                  {user.first_name ? user.first_name[0] : user.username[0]}
                </div>
                <div className="hidden lg:block text-xs">
                  <p className="font-semibold text-slate-800 leading-tight">
                    {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                  </p>
                  <p className="text-slate-500 text-[10px] capitalize">{user.role}</p>
                </div>
              </button>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            {renderNavLinks()}
          </div>
        )}
      </header>

      {/* User Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                  {user.first_name ? user.first_name[0] : user.username[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                  </h3>
                  <p className="text-xs text-slate-500">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-3 border-y border-slate-100 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-800 capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-800 font-medium">{user.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-800 font-medium">{user.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-800 font-medium">{user.department || '—'}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  logout();
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
