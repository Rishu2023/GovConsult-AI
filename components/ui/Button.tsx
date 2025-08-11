import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border border-primary/40 text-primary bg-transparent hover:bg-primary/10"
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: 'default' | 'icon';
};

const sizes = {
  default: "h-10 px-4 py-2",
  icon: "h-10 w-10"
};

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'default', size = 'default', ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};