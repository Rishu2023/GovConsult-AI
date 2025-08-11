
import React, { useState, useMemo } from 'react';
import { REGULATIONS } from '../constants';
import { Icons } from './icons/Icons';
import { cn } from '../lib/utils';

interface RegulationSelectorProps {
  selectedRegulationIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const RegulationSelector: React.FC<RegulationSelectorProps> = ({ selectedRegulationIds, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (id: string) => {
    const newSelection = selectedRegulationIds.includes(id)
      ? selectedRegulationIds.filter(regId => regId !== id)
      : [...selectedRegulationIds, id];
    onSelectionChange(newSelection);
  };

  const filteredRegulations = useMemo(() => {
    if (!searchTerm) return REGULATIONS;
    return REGULATIONS.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.region && r.region.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const groupedRegulations = useMemo(() => {
    return filteredRegulations.reduce((acc, reg) => {
      const region = reg.region || 'Other';
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(reg);
      return acc;
    }, {} as Record<string, typeof REGULATIONS>);
  }, [filteredRegulations]);
  
  const selectedRegulations = useMemo(() => {
    return REGULATIONS.filter(r => selectedRegulationIds.includes(r.id));
  }, [selectedRegulationIds]);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Selected Regulations Pills */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Selected ({selectedRegulations.length})</h3>
        <div className="flex flex-wrap gap-2 min-h-[30px] p-2 rounded-lg border border-border bg-background/50">
          {selectedRegulations.length > 0 ? (
            selectedRegulations.map(reg => (
              <span key={reg.id} className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary-foreground border border-primary/30 animate-in fade-in-0">
                {reg.name}
                <button onClick={() => handleToggle(reg.id)} className="hover:text-foreground rounded-full hover:bg-black/20 p-0.5">
                  <Icons.x className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-xs text-muted-foreground p-1">No regulations selected. Please choose from the list below.</p>
          )}
        </div>
      </div>
      
      {/* 2. Search and List */}
      <div className="flex flex-col gap-2">
         <h3 className="text-sm font-medium text-muted-foreground">Available Regulations</h3>
        {/* Search Input */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search regulations by name or region..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-input border border-input rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        {/* Scrollable List */}
        <div className="border border-border rounded-lg max-h-80 overflow-y-auto p-2 bg-background/50">
          {Object.entries(groupedRegulations).sort(([a], [b]) => a.localeCompare(b)).map(([region, regs]) => (
            <div key={region} className="mb-2">
              <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground sticky top-0 bg-background/80 backdrop-blur-sm -mx-2 px-2 z-10">{region}</h4>
              {regs.map(regulation => (
                <div
                  key={regulation.id}
                  onClick={() => handleToggle(regulation.id)}
                  className="flex items-start justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                      <div className={cn('flex-shrink-0 mt-1 flex items-center justify-center h-5 w-5 rounded border-2 transition-colors', selectedRegulationIds.includes(regulation.id) ? 'border-primary bg-primary' : 'border-muted-foreground/50 bg-secondary')}>
                           {selectedRegulationIds.includes(regulation.id) && <Icons.check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-grow">
                        <span className="text-sm text-foreground/90">{regulation.name}</span>
                        <p className="text-xs text-muted-foreground">{regulation.description}</p>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {filteredRegulations.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No regulations found for "{searchTerm}".</p>
          )}
        </div>
      </div>
    </div>
  );
};