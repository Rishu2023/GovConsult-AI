
import React from 'react';
import { cn } from '../../lib/utils';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-md border border-input bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        className
      )}
      {...props}
    />
  );
};