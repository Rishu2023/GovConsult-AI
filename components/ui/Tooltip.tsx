
import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
    }, 150); // Small delay to allow moving mouse from trigger to tooltip
  };

  return (
    <div 
        className="relative inline-flex" 
        onMouseEnter={showTooltip} 
        onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-center text-popover-foreground bg-popover border border-border rounded-md shadow-lg z-50",
            "transform -translate-x-1/2 left-1/2",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};