
import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex items-center p-6 pt-0", className)}>
    {children}
  </div>
);