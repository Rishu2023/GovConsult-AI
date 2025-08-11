import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons/Icons';
import { runScenarioAnalysis } from '../services/geminiService';
import { ScenarioResult, ScenarioRisk, RiskLevel } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const getRiskColor = (level: RiskLevel) => {
    switch (level) {
        case 'High': return 'text-red-400';
        case 'Medium': return 'text-yellow-400';
        case 'Low': return 'text-green-400';
        default: return 'text-muted-foreground';
    }
};

const RiskMatrixTable: React.FC<{ risks: ScenarioRisk[] }> = ({ risks }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[40%]">Challenge</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Impact</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {risks.map((risk, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <p className="font-semibold text-foreground">{risk.challenge}</p>
                        <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                    </TableCell>
                    <TableCell className={cn("font-medium", getRiskColor(risk.likelihood))}>{risk.likelihood}</TableCell>
                    <TableCell className={cn("font-medium", getRiskColor(risk.impact))}>{risk.impact}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

export const ScenarioView: React.FC = () => {
  const [scenarioText, setScenarioText] = useState('');
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeOutcomeTab, setActiveOutcomeTab] = useState<'Best Case' | 'Most Likely' | 'Worst Case'>('Most Likely');

  const handleAnalyze = useCallback(async () => {
    if (!scenarioText.trim()) {
      alert("Please describe a scenario to analyze.");
      return;
    }
    setIsLoading(true);
    setScenarioResult(null);
    const result = await runScenarioAnalysis(scenarioText);
    setScenarioResult(result);
  }, [scenarioText]);
  
  // Effect to reset loading state if analysis fails
  useEffect(() => {
    if (isLoading && !scenarioResult) {
        const timer = setTimeout(() => setIsLoading(false), 10000); // Failsafe timeout
        return () => clearTimeout(timer);
    }
     if(!isLoading && scenarioResult){
        // Do nothing, success
    } else if(isLoading && scenarioResult){
        setIsLoading(false);
    }
  }, [isLoading, scenarioResult]);


  const activeOutcome = scenarioResult?.outcomes.find(o => o.title === activeOutcomeTab);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <Header />
      <div className="mt-12 flex flex-col items-center gap-8 w-full">
        <motion.div className="w-full max-w-4xl" variants={itemVariants}>
          <div className="bg-card/60 p-6 rounded-lg border border-border/50 backdrop-blur-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">What-If Scenario Modeling</h2>
            <p className="text-muted-foreground mb-4 text-sm">Propose a new policy, regulation, or strategic change to predict its potential challenges, operational impact, and legal precedents. This module acts as your AI-powered strategic advisor.</p>
            <Textarea
              placeholder="e.g., 'What if our state implemented a law requiring all businesses to obtain explicit consent before using biometric data for any purpose?'"
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              className="min-h-[150px] bg-input"
              disabled={isLoading}
            />
          </div>
        </motion.div>
        
        <motion.div className="w-full max-w-4xl flex justify-end" variants={itemVariants}>
          <Button onClick={handleAnalyze} disabled={isLoading || !scenarioText.trim()} className="w-full sm:w-auto shadow-lg shadow-primary/20">
            {isLoading ? (
              <>
                <Icons.loader className="mr-2 h-5 w-5 animate-spin" />
                Modeling Scenario...
              </>
            ) : (
              <>
                <Icons.lightbulb className="mr-2 h-5 w-5" />
                Run Predictive Analysis
              </>
            )}
          </Button>
        </motion.div>

        {(isLoading && !scenarioResult) && (
             <motion.div className="w-full max-w-5xl text-center" variants={itemVariants}>
                <p className="text-muted-foreground">AI is running simulations and consulting legal precedents...</p>
             </motion.div>
        )}

        {scenarioResult && (
          <motion.div 
            className="w-full max-w-5xl space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-primary">Scenario Analysis Report</motion.h2>

            <motion.div variants={itemVariants}>
                <Card className="bg-card/60 border-border/50 backdrop-blur-lg">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-primary"><Icons.barChart className="h-5 w-5" />Risk Matrix</CardTitle></CardHeader>
                    <CardContent><RiskMatrixTable risks={scenarioResult.riskMatrix} /></CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-card/60 border-border/50 backdrop-blur-lg">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2 text-lg text-primary"><Icons.trendingUp className="h-5 w-5" />Potential Outcomes</CardTitle>
                         <div className="border-b border-border/50 mt-2">
                            <nav className="-mb-px flex space-x-6">
                                {scenarioResult.outcomes.map(outcome => (
                                    <button key={outcome.title} onClick={() => setActiveOutcomeTab(outcome.title)} className={cn('whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm', activeOutcomeTab === outcome.title ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>{outcome.title}</button>
                                ))}
                            </nav>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{activeOutcome?.description}</p>
                    </CardContent>
                </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
                 <Card className="bg-card/60 border-border/50 backdrop-blur-lg">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-primary"><Icons.checkCircle className="h-5 w-5" />Strategic Recommendations</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {scenarioResult.recommendations.map((rec, i) => (
                            <div key={i} className="p-3 rounded-md bg-background/50 border border-border/50">
                                <p className="font-semibold text-foreground">{rec.recommendation}</p>
                                <p className="text-xs text-muted-foreground mt-1">{rec.rationale}</p>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs border-t border-border pt-2">
                                    <div><p className="font-semibold">Staffing</p><p className="text-muted-foreground">{rec.estimatedStaffing}</p></div>
                                    <div><p className="font-semibold">Budget</p><p className="text-muted-foreground">{rec.estimatedBudget}</p></div>
                                    <div><p className="font-semibold">Timeline</p><p className="text-muted-foreground">{rec.estimatedTimeline}</p></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                 <Card className="bg-card/60 border-border/50 backdrop-blur-lg">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-primary"><Icons.trendingDown className="h-5 w-5" />Strategic Opportunities</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {scenarioResult.opportunities.map((op, i) => (
                             <div key={i} className="border-l-2 border-primary/50 pl-3">
                                <p className="font-semibold text-foreground">{op.opportunity}</p>
                                <p className="text-xs text-muted-foreground">{op.rationale}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};