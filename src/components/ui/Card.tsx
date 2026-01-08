import React, { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: 'default' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    const baseStyles = 'rounded-xl p-6';

    const variants = {
      default: 'bg-slate-900 border border-slate-700',
      elevated: 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
