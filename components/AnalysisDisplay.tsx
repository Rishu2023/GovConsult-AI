
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult, ComplianceStatus, ComplianceIssue, AuditEntry } from '../types';
import { Icons } from './icons/Icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Tooltip } from './ui/Tooltip';
import { REGULATIONS } from '../constants';
import { cn } from '../lib/utils';
import { RoiDisplay } from './RoiDisplay';
import { Button } from './ui/Button';

type Tab = 'issues' | 'risk' | 'audit';

// --- Skeleton Loader ---
const SkeletonLoader: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="h-6 w-1/4 bg-muted/80 rounded"></div>
            <div className="h-8 w-1/3 bg-muted/80 rounded-full"></div>
        </div>
        <div className="h-4 w-full bg-muted/80 rounded"></div>
        <div className="h-4 w-3/4 bg-muted/80 rounded"></div>
        
        <div className="border-b border-border/50">
            <div className="flex space-x-6">
                <div className="h-10 w-24 bg-muted/80 rounded-t-lg"></div>
                <div className="h-10 w-24 bg-muted/80 rounded-t-lg"></div>
                <div className="h-10 w-24 bg-muted/80 rounded-t-lg"></div>
            </div>
        </div>
        
        <div className="space-y-4">
            <div className="h-32 w-full bg-muted/80 rounded-lg"></div>
            <div className="h-32 w-full bg-muted/80 rounded-lg"></div>
        </div>
    </div>
);


const getStatusChipClass = (status: ComplianceStatus) => {
  switch (status) {
    case ComplianceStatus.COMPLIANT: return 'bg-green-500/20 text-green-400 border-green-500/30';
    case ComplianceStatus.NON_COMPLIANT: return 'bg-red-500/20 text-red-400 border-red-500/30';
    case ComplianceStatus.NEEDS_REVIEW: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case ComplianceStatus.ANALYSIS_FAILED: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

const getSeverityChipClass = (severity: 'High' | 'Medium' | 'Low') => {
  switch (severity) {
    case 'High': return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

const riskDefinitions = {
    High: 'Poses a significant legal, financial, or reputational risk. Likely violates core tenets of the regulation and requires immediate attention.',
    Medium: 'Represents a compliance gap that could lead to penalties or user distrust. Should be addressed in a timely manner.',
    Low: 'A minor issue or lack of clarity that deviates from best practices but is unlikely to result in severe penalties. Should be fixed to improve compliance posture.',
};

const StatusChip: React.FC<{ status: ComplianceStatus }> = ({ status }) => (
  <div className={`px-3 py-1 text-sm font-medium rounded-full inline-block border ${getStatusChipClass(status)}`}>
    {status.replace('_', ' ')}
  </div>
);

const ExampleBlock: React.FC<{ before: string, after: string }> = ({ before, after }) => (
  <div className="mt-3 text-xs space-y-2">
    <div>
      <h5 className="font-semibold text-red-400/80 mb-1 flex items-center gap-2"><Icons.minusCircle className="h-3.5 w-3.5"/>Before</h5>
      <pre className="p-2 rounded-md bg-red-500/10 text-red-400/80 whitespace-pre-wrap font-mono ml-5 border-l-2 border-red-500/30 pl-3"><code>{before}</code></pre>
    </div>
    <div>
      <h5 className="font-semibold text-green-400/80 mb-1 flex items-center gap-2"><Icons.plusCircle className="h-3.5 w-3.5"/>After</h5>
      <pre className="p-2 rounded-md bg-green-500/10 text-green-400/80 whitespace-pre-wrap font-mono ml-5 border-l-2 border-green-500/30 pl-3"><code>{after}</code></pre>
    </div>
  </div>
);

const IssueCard = ({ issue, index }: { issue: ComplianceIssue, index: number }) => (
  <motion.div 
    className="bg-background/50 p-4 rounded-lg border border-border transition-all hover:border-primary/20"
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    initial="hidden"
    animate="visible"
    transition={{ delay: index * 0.05 }}
  >
    <div className="flex justify-between items-start mb-2 gap-4">
      <h4 className="font-semibold text-foreground">Issue: <span className="text-muted-foreground font-normal italic">"{issue.clause}"</span></h4>
       <div className={`flex items-center gap-2 flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityChipClass(issue.severity)}`}>
        <span>{issue.severity} Risk</span>
         <Tooltip content={<p className="max-w-xs text-xs">{riskDefinitions[issue.severity]}</p>}>
            <Icons.info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
        </Tooltip>
      </div>
    </div>
    <p className="text-sm text-muted-foreground mb-4"><span className="font-semibold text-foreground">Problem:</span> {issue.issueDescription}</p>
    
    <div className="border-t border-border/50 pt-3 space-y-3">
        <p className="text-sm text-foreground"><span className="font-semibold text-primary">Recommendation:</span> {issue.recommendation}</p>
        <a href={issue.regulationLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1.5">
          <Icons.externalLink className="h-3.5 w-3.5" /> View Regulation Source
        </a>
        <ExampleBlock before={issue.recommendationExample.before} after={issue.recommendationExample.after} />
    </div>
  </motion.div>
);

const RiskCard = ({ issue, index }: { issue: ComplianceIssue, index: number }) => (
   <motion.div 
    className="bg-background/50 p-4 rounded-lg border border-border"
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    initial="hidden"
    animate="visible"
    transition={{ delay: index * 0.05 }}
  >
    <div className="flex justify-between items-start mb-2 gap-4">
      <h4 className="font-semibold text-foreground">Risk for Issue: <span className="text-muted-foreground font-normal italic">"{issue.clause}"</span></h4>
      <div className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityChipClass(issue.severity)}`}>
        {issue.severity} Risk
      </div>
    </div>
     <div className="border-t border-border/50 pt-3 mt-3 space-y-3 text-sm">
        <p><strong className="text-primary">Risk Analysis:</strong> <span className="text-muted-foreground">{issue.riskAnalysis}</span></p>
        <p><strong className="text-primary">Mitigation Strategy:</strong> <span className="text-muted-foreground">{issue.mitigation}</span></p>
    </div>
  </motion.div>
);

const AuditTrailCard: React.FC<{ entry: AuditEntry; onSelect: () => void }> = ({ entry, onSelect }) => {
    const issueCount = entry.analysisResult.issues.length;
    const regNames = entry.regulationIds.map(id => REGULATIONS.find(r => r.id === id)?.name || id).join(', ');

    return (
        <motion.div
            className="bg-background/50 p-4 rounded-lg border border-border flex justify-between items-center"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
            <div>
                <p className="font-semibold text-foreground">Analysis from {new Date(entry.timestamp).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Status: <span className="font-medium">{entry.analysisResult.complianceStatus.replace('_', ' ')}</span> | Issues: {issueCount} | Regulations: {regNames}
                </p>
            </div>
            <Button variant="outline" size="default" className="h-auto py-1 px-3 text-xs" onClick={onSelect}>View Report</Button>
        </motion.div>
    )
}

export const AnalysisDisplay = ({ 
    isLoading, 
    result, 
    auditTrail, 
    onAuditSelect 
}: { 
    isLoading: boolean; 
    result: AnalysisResult | null;
    auditTrail: AuditEntry[];
    onAuditSelect: (entry: AuditEntry) => void;
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('issues');

  const issuesByRegulation = useMemo(() => {
    if (!result?.issues) return {};
    return result.issues.reduce((acc, issue) => {
      const regulationName = REGULATIONS.find(r => r.id === issue.regulationId)?.name || issue.regulationId;
      if (!acc[regulationName]) acc[regulationName] = [];
      acc[regulationName].push(issue);
      return acc;
    }, {} as Record<string, ComplianceIssue[]>);
  }, [result]);
  
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-6 border-2 border-dashed border-border/50 rounded-lg min-h-[300px]">
        <Icons.fileText className="h-12 w-12" />
        <p className="mt-4 text-lg font-semibold">Analysis Results</p>
        <p className="text-sm mt-1 max-w-sm">Your compliance report, risk analysis, and audit trail will appear here after an analysis is performed.</p>
      </div>
    );
  }

  const hasIssues = result.issues && result.issues.length > 0;

  return (
    <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Overall Status</CardTitle>
          <StatusChip status={result.complianceStatus} />
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-muted-foreground">{result.summary}</p>
        </CardContent>
      </Card>
      
      {result.complianceStatus !== ComplianceStatus.ANALYSIS_FAILED && <RoiDisplay result={result} />}

      {result.complianceStatus !== ComplianceStatus.ANALYSIS_FAILED && (
          <div className="border-b border-border/50">
              <nav className="-mb-px flex space-x-6">
                  <button onClick={() => setActiveTab('issues')} className={cn('whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm', activeTab === 'issues' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>Compliance Issues</button>
                  <button onClick={() => setActiveTab('risk')} className={cn('whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm', activeTab === 'risk' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>Risk Analysis</button>
                  <button onClick={() => setActiveTab('audit')} className={cn('whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm', activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>Audit Trail</button>
              </nav>
          </div>
      )}

      <div className="mt-6">
        {activeTab === 'issues' && (
          hasIssues ? (
            <div className="space-y-6">
              {Object.entries(issuesByRegulation).map(([regulationName, issues]) => (
                <div key={regulationName}>
                  <h3 className="text-md font-semibold text-primary mb-3 border-b-2 border-primary/20 pb-2">
                    {regulationName} ({issues.length} issues)
                  </h3>
                  <div className="space-y-4">
                    {issues.map((issue, index) => (
                      <IssueCard key={`${issue.regulationId}-issues-${index}`} issue={issue} index={index} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : result.complianceStatus !== ComplianceStatus.ANALYSIS_FAILED ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground text-center py-10 border-2 border-dashed border-green-500/20 rounded-lg">
              <Icons.checkCircle2 className="h-12 w-12 text-green-400"/>
              <p className="mt-4 text-lg font-semibold">No Issues Found</p>
              <p className="text-sm">Based on the analysis, the provided text appears to be compliant.</p>
            </div>
          ) : null
        )}

        {activeTab === 'risk' && (
            hasIssues ? (
                 <div className="space-y-4">
                    {result.issues.map((issue, index) => (
                      <RiskCard key={`${issue.regulationId}-risk-${index}`} issue={issue} index={index} />
                    ))}
                  </div>
            ) : result.complianceStatus !== ComplianceStatus.ANALYSIS_FAILED ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground text-center py-10 border-2 border-dashed border-border rounded-lg">
                    <Icons.checkCircle2 className="h-12 w-12"/>
                    <p className="mt-4 text-lg font-semibold">No Risks to Analyze</p>
                    <p className="text-sm">The policy is compliant, so no risks were identified.</p>
                </div>
            ) : null
        )}
        
        {activeTab === 'audit' && (
            <div className="space-y-4">
                {auditTrail.length > 0 ? (
                    auditTrail.map(entry => <AuditTrailCard key={entry.id} entry={entry} onSelect={() => onAuditSelect(entry)} />)
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-center py-10 border-2 border-dashed border-border rounded-lg">
                        <Icons.history className="h-12 w-12"/>
                        <p className="mt-4 text-lg font-semibold">No Audit History</p>
                        <p className="text-sm max-w-md">Completed analyses for this engagement will be logged here, creating an immutable record for version control and legal defensibility.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </motion.div>
  );
};
