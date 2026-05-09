import fs from 'fs';
import path from 'path';
import { generateBrandedPresentation } from '../src/lib/m365/ppt';

async function main() {
  console.log('Generating Meridian AI Platform Presentation...');

  const slides = [
    {
      heading: 'The Challenge',
      body: 'Commercial real estate advisors spend excessive time on repetitive tasks.\n\n- Drafting standard emails and deal memos\n- Searching through past interactions for precedent\n- Formatting presentations to strict brand standards\n\nSolution: An AI co-pilot embedded directly into the firm\'s M365 workflow.'
    },
    {
      heading: 'Phase 1: Foundation',
      body: 'Built a secure, LLM-agnostic architecture integrated with Microsoft 365.\n\n- Entra ID Single Sign-On (SSO) for security\n- Microsoft Graph API integration for Word and Outlook\n- Agnostic Router: Swap between Claude 3.5 Sonnet and OpenAI instantly\n- Version-controlled, locked system prompt to ensure professional tone',
      imagePath: path.join(process.cwd(), 'public', 'screenshots', 'dashboard.png')
    },
    {
      heading: 'Phase 2: The Memory Layer',
      body: 'Transformed isolated AI chats into a shared organizational brain.\n\n- Interaction Logging: All AI chats automatically saved to Cosmos DB\n- Vectorization: Content embedded using OpenAI text-embedding-3-small\n- Retrieval-Augmented Generation (RAG): Azure AI Search retrieves past knowledge\n- Result: The AI gets smarter and learns firm conventions over time',
      imagePath: path.join(process.cwd(), 'public', 'screenshots', 'chat.png')
    },
    {
      heading: 'Phase 3: Production Lock-in',
      body: 'Expanded capabilities while locking down security and brand identity.\n\n- Advanced M365: Automated generation of PowerPoint decks and Excel models\n- Branded Output: Hardcoded firm templates (colors, fonts, logos) into exports\n- Role-Based Access Control (RBAC): Admin panels restricted via JWT claims\n- Data Loss Prevention (DLP): Strict guardrails against hallucinating or leaking PII'
    },
    {
      heading: 'Technical Architecture',
      body: 'Built on modern, enterprise-grade cloud technologies.\n\n- Frontend: Next.js 15, React 19, Tailwind CSS 4\n- Backend: Node.js Edge runtime, Azure AI Search, Cosmos DB\n- Security: Microsoft Entra ID (OBO flow), strict CORS, RBAC\n- Infrastructure: Fully automated deployment via Azure Bicep templates',
      imagePath: path.join(process.cwd(), 'public', 'screenshots', 'architecture.png')
    },
    {
      heading: 'Source Code',
      body: 'Review the full architecture and implementation details on GitHub:\n\nhttps://github.com/lorenzouriel/m365-ai-ecosystem.git'
    }
  ];

  try {
    const base64Data = await generateBrandedPresentation('Meridian AI Platform', slides);
    
    // Decode base64 and write to file
    const buffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(process.cwd(), 'Meridian_AI_Project_Presentation.pptx');
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`\nSuccess! Presentation saved to:\n${outputPath}`);
  } catch (error) {
    console.error('Failed to generate presentation:', error);
  }
}

main();
