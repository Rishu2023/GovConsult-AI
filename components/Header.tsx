
import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './icons/Icons';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Header = () => {
  return (
    <motion.header 
      className="relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 right-0 z-50">
        <ThemeSwitcher />
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-4">
          <Icons.logo className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            GovConsult AI
          </h1>
        </div>
        <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
          Leveraging Large Language Models to automate government regulatory compliance analysis, offering a glimpse into the future of GovTech beyond traditional consulting.
        </p>
      </div>
    </motion.header>
  );
};