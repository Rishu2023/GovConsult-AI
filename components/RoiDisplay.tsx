import React, { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { AnalysisResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Icons } from './icons/Icons';

interface RoiDisplayProps {
  result: AnalysisResult;
}

const CONSULTANT_HOURLY_RATE = 350; // Average rate for a senior compliance consultant

// Heuristic for estimating hours saved based on issue severity
const hoursPerIssue = {
  High: 8,
  Medium: 4,
  Low: 1,
};

const AnimatedMetric: React.FC<{
  toValue: number;
  formatter: (value: number) => string;
}> = ({ toValue, formatter }) => {
  const nodeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, toValue, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = formatter(value);
      },
    });

    return () => controls.stop();
  }, [toValue, formatter]);

  // Set initial text content to avoid flash of empty content
  const initialText = formatter(0);

  return (
    <p ref={nodeRef} className="text-2xl font-bold text-primary">
      {initialText}
    </p>
  );
};

export const RoiDisplay: React.FC<RoiDisplayProps> = ({ result }) => {
  if (!result || result.issues.length === 0) {
    return null;
  }

  const estimatedHoursSaved = result.issues.reduce((acc, issue) => {
    return acc + (hoursPerIssue[issue.severity] || 0);
  }, 0);

  const estimatedCostSaved = estimatedHoursSaved * CONSULTANT_HOURLY_RATE;

  // An AI process is much faster than human review. Assume a 2-minute AI run vs. hours of manual work.
  const timeReduction = estimatedHoursSaved > 0 ? 1 - (2 / 60) / estimatedHoursSaved : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-lg">
            <Icons.history className="h-5 w-5" />
            Quantifiable ROI Metrics (Estimated)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-background/50 p-3 rounded-lg">
              <AnimatedMetric toValue={estimatedHoursSaved} formatter={(v) => v.toFixed(0)} />
              <p className="text-xs text-muted-foreground">Consulting Hours Saved</p>
            </div>
            <div className="bg-background/50 p-3 rounded-lg">
              <AnimatedMetric toValue={estimatedCostSaved} formatter={(v) => `$${Math.round(v).toLocaleString()}`} />
              <p className="text-xs text-muted-foreground">Cost Reduction</p>
            </div>
            <div className="bg-background/50 p-3 rounded-lg">
               <AnimatedMetric toValue={timeReduction * 100} formatter={(v) => `~${v.toFixed(0)}%`} />
              <p className="text-xs text-muted-foreground">Time Reduction</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Estimates are based on average consultant rates and time-to-remediate for issues of similar severity.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};