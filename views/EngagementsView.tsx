import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { useEngagements } from '../hooks/useEngagements';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons/Icons';
import { cn } from '../lib/utils';

export const EngagementsView: React.FC<{ engagementsHook: ReturnType<typeof useEngagements> }> = ({ engagementsHook }) => {
    const { engagements, activeEngagement, setActiveEngagementId, createEngagement } = engagementsHook;
    const [newEngagementName, setNewEngagementName] = useState('');

    const handleCreate = () => {
        if (newEngagementName.trim()) {
            createEngagement(newEngagementName);
            setNewEngagementName('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8 max-w-7xl"
        >
            <Header />

            <div className="mt-12 w-full max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-primary mb-6">Manage Engagements</h2>
                
                <div className="bg-card/60 p-6 rounded-lg border border-border/50 backdrop-blur-lg mb-8">
                    <h3 className="text-lg font-semibold mb-3">Create New Engagement</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newEngagementName}
                            onChange={(e) => setNewEngagementName(e.target.value)}
                            placeholder="e.g., FedRAMP Authorization Q3"
                            className="flex-grow bg-input border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <Button onClick={handleCreate} disabled={!newEngagementName.trim()}>
                            <Icons.plusCircle className="mr-2 h-4 w-4" /> Create
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3">Existing Engagements</h3>
                    <div className="space-y-3">
                        {engagements.length > 0 ? (
                            engagements.map(eng => (
                                <motion.div
                                    key={eng.id}
                                    onClick={() => setActiveEngagementId(eng.id)}
                                    className={cn(
                                        "p-4 rounded-lg border flex justify-between items-center cursor-pointer transition-all",
                                        activeEngagement?.id === eng.id 
                                            ? 'bg-primary/20 border-primary' 
                                            : 'bg-card/60 border-border/50 hover:border-accent'
                                    )}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div>
                                        <p className="font-semibold">{eng.name}</p>
                                        <p className="text-xs text-muted-foreground">Created: {new Date(eng.createdAt).toLocaleDateString()} | Reports: {eng.auditTrail.length}</p>
                                    </div>
                                    {activeEngagement?.id === eng.id && (
                                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
                                            <Icons.checkCircle className="h-5 w-5"/>
                                            Active
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No engagements found. Create one to get started.</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
