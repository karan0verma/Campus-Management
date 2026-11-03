import React from 'react';
import { Clock, UserCheck, Wrench, CheckCircle2, Check, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  switch (status) {
    case 'Pending':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Pending
        </span>
      );
    case 'Assigned':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
          Assigned
        </span>
      );
    case 'In Progress':
      return (
        <span className={`inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          <Wrench className="w-3.5 h-3.5 text-indigo-500" />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Resolved
        </span>
      );
    case 'Working':
      return (
        <span className={`inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-200 ${sizeClasses}`}>
          <Check className="w-3.5 h-3.5 text-green-600" />
          Working
        </span>
      );
    case 'Not Working':
      return (
        <span className={`inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          Not Working
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
