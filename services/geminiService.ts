import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ComplianceStatus, Regulation, ScenarioResult } from '../types';
import { REGULATIONS } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. The application will not be able to connect to the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// --- Compliance Analysis Service ---

const complianceResponseSchema = {
  type: Type.OBJECT,
  properties: {
    complianceStatus: {
      type: Type.STRING,
      enum: [ComplianceStatus.COMPLIANT, ComplianceStatus.NON_COMPLIANT, ComplianceStatus.NEEDS_REVIEW],
      description: 'The overall compliance status. If any regulation is NON_COMPLIANT, this should be NON_COMPLIANT.'
    },
    summary: {
      type: Type.STRING,
      description: 'A brief, one to two sentence summary of the overall analysis across all selected regulations.'
    },
    issues: {
      type: Type.ARRAY,
      description: 'A list of identified compliance issues. This should be an empty array if there are no issues.',
      items: {
        type: Type.OBJECT,
        properties: {
          clause: { type: Type.STRING, description: 'The specific clause or part of the policy text that has an issue. If not applicable, state "General Policy".' },
          issueDescription: { type: Type.STRING, description: 'A detailed explanation of why this is a compliance issue.' },
          severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: 'The severity level of the issue.' },
          recommendation: { type: Type.STRING, description: 'A specific, actionable recommendation to fix the issue.' },
          regulationId: { type: Type.STRING, description: 'The ID of the regulation this issue pertains to (e.g., "gdpr", "ccpa_cpra"). This is mandatory.' },
          regulationLink: { type: Type.STRING, description: 'An authoritative URL pointing to the specific article or section of the regulation that is being violated. Be as specific as possible.' },
          recommendationExample: {
            type: Type.OBJECT,
            description: 'A concrete example showing how to apply the recommendation.',
            properties: {
              before: { type: Type.STRING, description: 'A short snippet of the original text that is problematic.' },
              after: { type: Type.STRING, description: 'A short snippet showing the text after applying the recommendation.' }
            },
            required: ['before', 'after'],
          },
          riskAnalysis: {
            type: Type.STRING,
            description: 'A strategic analysis of the legal, operational, and compliance risks this issue poses to the organization. Think like a high-end consultant.'
          },
          mitigation: {
            type: Type.STRING,
            description: 'A concise, strategic plan to mitigate the identified risks, beyond just the textual recommendation.'
          }
        },
        required: ['clause', 'issueDescription', 'severity', 'recommendation', 'regulationId', 'regulationLink', 'recommendationExample', 'riskAnalysis', 'mitigation'],
      },
    },
  },
  required: ['complianceStatus', 'summary', 'issues'],
};


export const analyzePolicyCompliance = async (policyText: string, regulationIds: string[]): Promise<AnalysisResult> => {
  if (!API_KEY) {
    return {
      complianceStatus: ComplianceStatus.ANALYSIS_FAILED,
      summary: "API Key is not configured. Please ensure the API_KEY environment variable is set.",
      issues: [],
    };
  }
  
  const selectedRegulations = REGULATIONS.filter(r => regulationIds.includes(r.id));
  if (selectedRegulations.length === 0) {
    throw new Error('No valid regulations selected.');
  }

  const regulationsText = selectedRegulations.map(r => `- ${r.name}: ${r.description} (Source: ${r.sourceUrl || 'N/A'})`).join('\n');

  const prompt = `
    You are an automated, multi-agent government consulting platform. Your core function is to replace entire consulting engagements by providing end-to-end, agency-ready analysis. You will operate as a team of three specialized agents:
    1.  **Legal Agent:** Identifies non-compliance by cross-referencing policy against statutes.
    2.  **Risk Agent:** Assesses the strategic risk of each compliance gap.
    3.  **Operations Agent:** Provides actionable mitigation and remediation steps.

    Your task is to analyze the following policy document for compliance with ALL of the specified regulations.

    **Regulations for Analysis:**
    ${regulationsText}

    **Policy Document to Analyze:**
    ---
    ${policyText}
    ---

    Perform an exhaustive analysis. For each and every issue you discover, you MUST provide a structured JSON object with the following fields, simulating the combined output of your multi-agent team:
    1.  **'regulationId'**: Pinpoint the exact regulation ID that is violated.
    2.  **'issueDescription'**: Concicely explain the non-compliance issue.
    3.  **'recommendation'**: Provide a clear, step-by-step recommendation for remediation.
    4.  **'regulationLink'**: CRITICAL - Provide a deep, authoritative URL to the specific legal article or control being violated.
    5.  **'recommendationExample'**: CRITICAL - Provide a "before" and "after" code-style snippet from the policy. This is non-negotiable.
    6.  **'riskAnalysis'**: CRITICAL - Provide a strategic analysis of the legal, operational, and compliance risks this issue poses. This is the output of your Risk Agent.
    7.  **'mitigation'**: CRITICAL - Provide a concise, strategic plan to mitigate the identified risks. This is the output of your Operations Agent.
    
    If the document is fully compliant, return an empty 'issues' array. Your analysis must be of the highest possible standard, ready for a senior government official.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: complianceResponseSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Error analyzing policy:", error);
    return {
      complianceStatus: ComplianceStatus.ANALYSIS_FAILED,
      summary: "The analysis could not be completed due to an API error. This may be due to content safety restrictions or an invalid API key. Check the console for details.",
      issues: [],
    };
  }
};

// --- Overhauled Scenario Modeling Service ---

const scenarioResponseSchema = {
  type: Type.OBJECT,
  properties: {
    riskMatrix: {
      type: Type.ARRAY,
      description: "A risk matrix identifying potential challenges.",
      items: {
        type: Type.OBJECT,
        properties: {
          challenge: { type: Type.STRING, description: "A concise description of the potential challenge." },
          description: { type: Type.STRING, description: "A detailed explanation of the challenge, weaving in relevant legal precedents or context." },
          likelihood: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          impact: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
        },
        required: ['challenge', 'description', 'likelihood', 'impact']
      }
    },
    outcomes: {
      type: Type.ARRAY,
      description: "A set of three potential outcomes: Best Case, Most Likely, and Worst Case.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, enum: ['Best Case', 'Most Likely', 'Worst Case'] },
          description: { type: Type.STRING, description: "A narrative description of this potential outcome." }
        },
        required: ['title', 'description']
      }
    },
    recommendations: {
      type: Type.ARRAY,
      description: "A list of actionable, strategic recommendations.",
      items: {
        type: Type.OBJECT,
        properties: {
          recommendation: { type: Type.STRING, description: "The specific recommendation." },
          rationale: { type: Type.STRING, description: "The strategic reasoning behind the recommendation." },
          estimatedStaffing: { type: Type.STRING, description: "Tangible estimate of staffing needs (e.g., '2 FTEs')." },
          estimatedBudget: { type: Type.STRING, description: "A budget range for implementation (e.g., '$5k - $10k')." },
          estimatedTimeline: { type: Type.STRING, description: "An estimated timeline (e.g., '3-6 weeks')." }
        },
        required: ['recommendation', 'rationale', 'estimatedStaffing', 'estimatedBudget', 'estimatedTimeline']
      }
    },
    opportunities: {
        type: Type.ARRAY,
        description: "A list of strategic opportunities that may arise from the situation.",
        items: {
            type: Type.OBJECT,
            properties: {
                opportunity: { type: Type.STRING, description: "The name of the opportunity." },
                rationale: { type: Type.STRING, description: "The strategic reasoning for this opportunity." }
            },
            required: ['opportunity', 'rationale']
        }
    }
  },
  required: ['riskMatrix', 'outcomes', 'recommendations', 'opportunities']
};

export const runScenarioAnalysis = async (scenarioText: string): Promise<ScenarioResult | null> => {
    if (!API_KEY) {
        console.error("API Key is not configured.");
        return null;
    }

    const prompt = `
        You are a high-end government strategy consultant from a top-tier firm like McKinsey or BCG, specializing in predictive analysis for senior policymakers. Your analysis must be neutral, quantitative, and strategically nuanced.

        **Scenario to Analyze:**
        ---
        ${scenarioText}
        ---

        Provide a comprehensive strategic analysis report in the following structured JSON format. Use measured, professional language and avoid hyperbole.

        1.  **riskMatrix**: Create a table of the top 3-5 challenges. For each challenge, provide a 'description' that weaves in relevant legal or policy context. Score 'likelihood' and 'impact' on a Low/Medium/High scale.
        2.  **outcomes**: Describe three distinct paths: 'Best Case', 'Most Likely', and 'Worst Case'. Frame these as narrative possibilities.
        3.  **opportunities**: Identify 2-3 strategic opportunities or positive externalities that could be leveraged, even in a negative scenario (e.g., "Opportunity to set new industry standards").
        4.  **recommendations**: For each recommendation, provide a 'rationale' and tangible resource estimates for 'estimatedStaffing', 'estimatedBudget', and 'estimatedTimeline'.

        Your entire output must conform to the provided JSON schema. Your credibility depends on providing structured, data-driven, and actionable advice.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scenarioResponseSchema,
                temperature: 0.3,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScenarioResult;
    } catch (error) {
        console.error("Error running scenario analysis:", error);
        return null;
    }
};