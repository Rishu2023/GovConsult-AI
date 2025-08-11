import { useState, useEffect, useCallback } from 'react';
import { Engagement, AuditEntry, AnalysisResult } from '../types';

const STORAGE_KEY = 'govconsult-ai-engagements';

export const useEngagements = () => {
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [activeEngagementId, setActiveEngagementId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedEngagements = localStorage.getItem(STORAGE_KEY);
            if (storedEngagements) {
                const parsedEngagements: Engagement[] = JSON.parse(storedEngagements);
                setEngagements(parsedEngagements);
                if (parsedEngagements.length > 0 && !activeEngagementId) {
                    setActiveEngagementId(parsedEngagements[0].id);
                }
            } else {
                // Create a default engagement if none exist
                const defaultEngagement: Engagement = {
                    id: `eng-${Date.now()}`,
                    name: 'Default Project',
                    createdAt: new Date().toISOString(),
                    auditTrail: [],
                };
                setEngagements([defaultEngagement]);
                setActiveEngagementId(defaultEngagement.id);
            }
        } catch (error) {
            console.error("Failed to load engagements from localStorage", error);
        }
    }, []);

    const saveEngagements = useCallback((updatedEngagements: Engagement[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEngagements));
            setEngagements(updatedEngagements);
        } catch (error) {
            console.error("Failed to save engagements to localStorage", error);
        }
    }, []);

    const createEngagement = (name: string) => {
        const newEngagement: Engagement = {
            id: `eng-${Date.now()}`,
            name,
            createdAt: new Date().toISOString(),
            auditTrail: [],
        };
        const updatedEngagements = [...engagements, newEngagement];
        saveEngagements(updatedEngagements);
        setActiveEngagementId(newEngagement.id);
    };

    const addAuditEntry = (engagementId: string, analysisResult: AnalysisResult, policyText: string, regulationIds: string[]) => {
        const newAuditEntry: AuditEntry = {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            analysisResult,
            policyText,
            regulationIds
        };
        
        const updatedEngagements = engagements.map(eng => {
            if (eng.id === engagementId) {
                return {
                    ...eng,
                    auditTrail: [newAuditEntry, ...eng.auditTrail], // Prepend to show newest first
                };
            }
            return eng;
        });
        saveEngagements(updatedEngagements);
    };

    const activeEngagement = engagements.find(eng => eng.id === activeEngagementId);

    return {
        engagements,
        activeEngagement,
        setActiveEngagementId,
        createEngagement,
        addAuditEntry,
    };
};
