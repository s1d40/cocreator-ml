import React from 'react';
import { ShieldAlert, Eye } from 'lucide-react';

interface ReadOnlyBadgeProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ReadOnlyBadge: React.FC<ReadOnlyBadgeProps> = ({
  label = 'READ-ONLY MODE',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-4 py-1.5 text-sm font-bold gap-2'
  };

  return (
    <span className={`inline-flex items-center rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-xs uppercase tracking-wider ${sizeClasses[size]}`}>
      <Eye className="w-3.5 h-3.5 text-amber-700" />
      <span>{label}</span>
      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
    </span>
  );
};
