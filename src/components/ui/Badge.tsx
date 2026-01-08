import React, { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    const variants = {
      default: 'bg-slate-700 text-slate-100',
      success: 'bg-emerald-700 text-white',
      warning: 'bg-amber-600 text-white',
      error: 'bg-red-600 text-white',
    };

    return (
      <span
        ref={ref}
        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
