import React, { useState, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { Header } from '../components/Header';
import { PolicyInput } from '../components/PolicyInput';
import { RegulationSelector } from '../components/RegulationSelector';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons/Icons';
import { analyzePolicyCompliance } from '../services/geminiService';
import { AnalysisResult, AuditEntry } from '../types';
import { REGULATIONS } from '../constants';
import { useEngagements } from '../hooks/useEngagements';

interface ComplianceViewProps {
  engagementsHook: ReturnType<typeof useEngagements>;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({ engagementsHook }) => {
  const { activeEngagement, addAuditEntry } = engagementsHook;

  const [policyText, setPolicyText] = useState<string>('');
  const [selectedRegulationIds, setSelectedRegulationIds] = useState<string[]>([REGULATIONS[0].id]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAnalyze = useCallback(async () => {
    if (!policyText.trim() || selectedRegulationIds.length === 0 || !activeEngagement) {
      alert("Please provide policy text, select regulations, and ensure an engagement is active.");
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    const result = await analyzePolicyCompliance(policyText, selectedRegulationIds);
    setAnalysisResult(result);
    setIsLoading(false);
    
    // Add to audit trail
    addAuditEntry(activeEngagement.id, result, policyText, selectedRegulationIds);

  }, [policyText, selectedRegulationIds, activeEngagement, addAuditEntry]);

  const handleAuditSelect = (entry: AuditEntry) => {
      setAnalysisResult(entry.analysisResult);
      setPolicyText(entry.policyText);
      setSelectedRegulationIds(entry.regulationIds);
  };
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

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
          {/* Step 1: Regulations */}
          <motion.div className="w-full max-w-4xl" variants={itemVariants}>
            <motion.div 
                className="bg-card/60 p-6 rounded-lg border border-border/50 backdrop-blur-lg"
                whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
            >
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary font-bold text-lg">1</span>
                Select Regulations
              </h2>
              <RegulationSelector
                selectedRegulationIds={selectedRegulationIds}
                onSelectionChange={setSelectedRegulationIds}
              />
            </motion.div>
          </motion.div>
          
          {/* Step 2: Policy Input */}
         <motion.div className="w-full max-w-4xl" variants={itemVariants}>
           <motion.div 
              className="bg-card/60 p-6 rounded-lg border border-border/50 backdrop-blur-lg"
              whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
           >
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                 <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary font-bold text-lg">2</span>
                Provide Policy
              </h2>
              <PolicyInput
                value={policyText}
                onChange={setPolicyText}
                isLoading={isLoading}
              />
            </motion.div>
          </motion.div>
          
          {/* Analyze Button */}
           <motion.div className="w-full max-w-4xl flex justify-end" variants={itemVariants}>
            <Button onClick={handleAnalyze} disabled={isLoading || !policyText.trim() || selectedRegulationIds.length === 0 || !activeEngagement} className="w-full sm:w-auto shadow-lg shadow-primary/20">
              {isLoading ? (
                <>
                  <Icons.loader className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Icons.sparkles className="mr-2 h-5 w-5" />
                  Analyze Compliance
                </>
              )}
            </Button>
          </motion.div>

          {/* Step 3: Analysis Result */}
          <motion.div className="w-full max-w-5xl" variants={itemVariants}>
             <motion.div 
                className="bg-card/60 p-6 rounded-lg border border-border/50 backdrop-blur-lg min-h-[300px]"
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
               <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary font-bold text-lg">3</span>
                  AI Analysis Result for "{activeEngagement?.name || '...'}"
               </h2>
               <AnalysisDisplay
                  isLoading={isLoading}
                  result={analysisResult}
                  auditTrail={activeEngagement?.auditTrail || []}
                  onAuditSelect={handleAuditSelect}
               />
             </motion.div>
          </motion.div>
        </div>
    </motion.div>
  );
};