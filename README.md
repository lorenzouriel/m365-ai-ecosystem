# M365 AI Integration Platform

> **Portfolio Project** — AI-powered workspace for commercial real estate, built on Microsoft 365 + Azure

A production-grade, LLM-agnostic orchestration platform that connects AI capabilities to Microsoft 365's data layer. Designed for a 25-person real estate advisory firm where all users share a single organizational knowledge base.

## ✨ Key Features

- **LLM-Agnostic Architecture** — Swap Claude ↔ OpenAI (or any model) via config, not code changes
- **Microsoft 365 Integration** — Word, Outlook, SharePoint, Teams via Microsoft Graph API
- **Shared Knowledge Base** — Azure AI Search with hybrid vector + keyword search across all team interactions
- **Branded Output** — All AI-generated documents follow locked brand templates (logos, colors, fonts)
- **Role-Based Access** — Admin/Analyst/Viewer roles via Microsoft Entra ID claims
- **Streaming Chat** — Real-time AI responses with markdown rendering and M365 action buttons
- **Infrastructure as Code** — One-command Azure deployment via Bicep templates

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Azure Deployment

```powershell
az login
.\infra\deploy.ps1 -ResourceGroup "rg-meridian-ai" -AppName "meridian-ai"
```

## 🔄 Model-Agnostic Design

The LLM Router abstracts provider APIs behind a unified interface:

```typescript
interface LLMProvider {
  chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse>;
  stream(messages: Message[], options?: LLMOptions): AsyncIterable<StreamChunk>;
}
```

Swapping models is a config change in `.env`:
```
LLM_DEFAULT_PROVIDER=claude     # or "openai"
LLM_CLAUDE_MODEL=claude-sonnet-4-20250514
```

## 🚀 Project Delivery Phases

### Phase 1 — Foundation (Completed)
- Azure infrastructure provisioned via Bicep
- M365 SSO via Entra ID (MSAL) and working web portal
- Claude API connected with a locked, version-controlled system prompt
- Word and Outlook integrations via Microsoft Graph

### Phase 2 — Memory Layer (Completed)
- Azure AI Search integration for hybrid vector + keyword search
- Interaction logging pipeline to Cosmos DB
- RAG pipeline seamlessly injecting organizational knowledge into the chat

### Phase 3 — Full M365 & Production Lock-in (Completed)
- PowerPoint (`pptxgenjs`) and Excel (`exceljs`) integrations for complex data exports
- Locked-in Branded Output Templates strictly enforcing the Meridian brand identity
- Role-Based Permissions (RBAC) hiding Admin interfaces from standard users
- Data Loss Prevention (DLP) guardrails to protect firm-sensitive data

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Auth | MSAL.js, Microsoft Entra ID |
| LLM | Claude API, OpenAI API (agnostic) |
| M365 | Microsoft Graph SDK |
| Document Gen | `pptxgenjs`, `exceljs` |
| Search | Azure AI Search |
| Database | Azure Cosmos DB |
| IaC | Azure Bicep |

---

*Built as a comprehensive portfolio demonstration of Microsoft 365 + AI integration capabilities.*
