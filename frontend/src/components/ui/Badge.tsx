import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30',
  secondary: 'bg-slate-700 text-slate-300 border-slate-600',
  destructive: 'bg-red-600/20 text-red-300 border-red-600/30',
  outline: 'border-slate-600 text-slate-300',
  success: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
  warning: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      variants[variant],
      className
    )}
    {...props}
  />
);
