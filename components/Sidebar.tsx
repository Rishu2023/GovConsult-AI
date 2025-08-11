import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './icons/Icons';
import { View } from '../App';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems = [
  { view: 'compliance' as View, label: 'Compliance Analysis', icon: Icons.logo },
  { view: 'scenario' as View, label: 'Scenario Modeling', icon: Icons.lightbulb },
  { view: 'engagements' as View, label: 'Engagements', icon: Icons.briefcase },
];

const NavItem: React.FC<{
  item: typeof navItems[0];
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  return (
    <motion.li
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        isActive ? 'bg-primary/20 text-primary' : 'hover:bg-accent/50 text-muted-foreground'
      )}
      whileHover={{ x: isActive ? 0 : 3 }}
    >
      <item.icon className="h-6 w-6" />
      <span className="font-medium text-sm">{item.label}</span>
    </motion.li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <motion.aside 
      className="w-64 min-h-screen bg-card/60 p-4 border-r border-border/50 backdrop-blur-lg flex flex-col"
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="flex items-center gap-2 px-3 mb-8">
        <Icons.sparkles className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          GovConsult AI
        </h1>
      </div>

      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              item={item}
              isActive={activeView === item.view}
              onClick={() => setActiveView(item.view)}
            />
          ))}
        </ul>
      </nav>

      <div className="mt-auto text-center text-muted-foreground text-xs">
          <p>v1.0 - Full Blueprint Prototype</p>
          <p className="mt-1">Powered by Google Gemini.</p>
      </div>
    </motion.aside>
  );
};
