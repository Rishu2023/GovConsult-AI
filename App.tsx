import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AnimatedGradientBackground } from './components/AnimatedGradientBackground';
import { Sidebar } from './components/Sidebar';
import { ComplianceView } from './views/ComplianceView';
import { ScenarioView } from './views/ScenarioView';
import { EngagementsView } from './views/EngagementsView';
import { useEngagements } from './hooks/useEngagements';

export type View = 'compliance' | 'scenario' | 'engagements';

const AppContent = () => {
  const [activeView, setActiveView] = useState<View>('compliance');
  const engagementsHook = useEngagements();

  const renderView = () => {
    switch (activeView) {
      case 'compliance':
        return <ComplianceView key="compliance" engagementsHook={engagementsHook} />;
      case 'scenario':
        return <ScenarioView key="scenario" />;
      case 'engagements':
        return <EngagementsView key="engagements" engagementsHook={engagementsHook} />;
      default:
        return <ComplianceView key="compliance" engagementsHook={engagementsHook} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <AnimatedGradientBackground />
      <div className="flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <LayoutGroup>
              <AnimatePresence mode="wait">
                {renderView()}
              </AnimatePresence>
            </LayoutGroup>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
