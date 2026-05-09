'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Sparkles,
  FileText,
  Mail,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Brain,
  Zap,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  taskType?: string;
  isStreaming?: boolean;
}

/**
 * AI Chat Page
 * 
 * Full-featured chat interface with:
 * - Streaming AI responses with markdown rendering
 * - Context-aware task type selection
 * - Quick action buttons on AI responses (Create in Word, Send as Email)
 * - Conversation history
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskType, setTaskType] = useState<string>('chat');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      taskType,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create placeholder for streaming response
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: 'Claude Sonnet 4',
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          taskType,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: m.content + text }
                : m
            )
          );
        }
      }

      // Mark streaming as complete
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, isStreaming: false }
            : m
        )
      );
    } catch {
      // Demo fallback: simulate a response
      const demoResponse = getDemoResponse(userMessage.content, taskType);
      let accumulated = '';

      for (const char of demoResponse) {
        accumulated += char;
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: accumulated }
              : m
          )
        );
        await new Promise(resolve => setTimeout(resolve, 8));
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, isStreaming: false }
            : m
        )
      );
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-brand-accent" />
            <h1 className="text-sm font-semibold text-brand-primary">AI Chat</h1>
          </div>
          <span className="text-xs text-neutral-400">|</span>
          <span className="text-xs text-neutral-500">
            {messages.length === 0 ? 'New conversation' : `${messages.length} messages`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Task Type Selector */}
          <div className="relative">
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-7 bg-neutral-100 border border-neutral-200 rounded-lg
                         text-xs font-medium text-neutral-600 cursor-pointer hover:bg-neutral-150
                         focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              <option value="chat">General Chat</option>
              <option value="email-draft">Email Draft</option>
              <option value="document-draft">Document Draft</option>
              <option value="deal-memo">Deal Memo</option>
              <option value="market-analysis">Market Analysis</option>
              <option value="summarization">Summarization</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg
                       text-xs font-medium hover:bg-brand-primary-light transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={(text) => setInput(text)} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex animate-fade-in',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn('max-w-[80%]', message.role === 'user' ? 'ml-12' : 'mr-12')}>
                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'px-5 py-3.5',
                      message.role === 'user'
                        ? 'chat-message-user'
                        : 'chat-message-assistant'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose text-sm">
                        <RenderMarkdown content={message.content} />
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-brand-accent/60 animate-pulse ml-0.5" />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>

                  {/* Message Actions */}
                  {message.role === 'assistant' && !message.isStreaming && message.content && (
                    <div className="flex items-center gap-1 mt-2 ml-1">
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-400
                                   hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        {copiedId === message.id ? (
                          <><Check className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-400
                                         hover:text-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer">
                        <FileText className="w-3 h-3" /> Create in Word
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-400
                                         hover:text-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer">
                        <Mail className="w-3 h-3" /> Send as Email
                      </button>
                      <span className="ml-auto text-[10px] text-neutral-300 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" />
                        {message.model}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 bg-white px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={taskType === 'email-draft' 
                  ? 'Describe the email you want to draft...' 
                  : taskType === 'deal-memo'
                  ? 'Describe the deal for the investment memo...'
                  : 'Ask anything about real estate, draft documents, or search your knowledge base...'}
                rows={1}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl resize-none
                           text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/50
                           placeholder:text-neutral-400 max-h-32 min-h-[44px]"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-11 h-11 bg-brand-primary text-white rounded-xl flex items-center justify-center
                         hover:bg-brand-primary-light transition-all duration-200 disabled:opacity-40
                         disabled:cursor-not-allowed cursor-pointer hover:shadow-md"
            >
              {isLoading ? (
                <RotateCcw className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-neutral-400">
              Press <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-[9px] font-mono">Enter</kbd> to send,{' '}
              <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-[9px] font-mono">Shift+Enter</kbd> for new line
            </p>
            <p className="text-[10px] text-neutral-400 flex items-center gap-1">
              <Brain className="w-2.5 h-2.5" />
              Connected to shared knowledge base (1,247 entries)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-brand-accent" />
      </div>
      <h2 className="text-xl font-semibold text-brand-primary mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
        How can I help today?
      </h2>
      <p className="text-sm text-neutral-500 mb-8 max-w-md">
        I&apos;m your AI assistant with access to Meridian&apos;s shared knowledge base and Microsoft 365 workspace.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.text}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="flex items-start gap-3 p-4 bg-white border border-neutral-200 rounded-xl
                       text-left hover:border-brand-accent/30 hover:shadow-md hover:-translate-y-0.5
                       transition-all duration-200 group cursor-pointer"
          >
            <suggestion.icon className="w-4 h-4 text-brand-primary mt-0.5 group-hover:text-brand-accent transition-colors shrink-0" />
            <span className="text-xs text-neutral-600 leading-relaxed">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RenderMarkdown({ content }: { content: string }) {
  // Simple markdown rendering for demo
  const html = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}

// ─── Demo Data ──────────────────────────────────────────────────

const suggestions = [
  {
    icon: FileText,
    text: 'Draft an investment memo for a $15M retail acquisition in Midtown Manhattan',
  },
  {
    icon: Mail,
    text: 'Compose a follow-up email to a client about Q4 refinancing terms',
  },
  {
    icon: Brain,
    text: 'What were the average cap rates for Class A office in Midtown East last quarter?',
  },
  {
    icon: Sparkles,
    text: 'Create a market overview for South Florida retail leasing',
  },
];

function getDemoResponse(query: string, taskType: string): string {
  if (taskType === 'deal-memo' || query.toLowerCase().includes('memo') || query.toLowerCase().includes('investment')) {
    return `# Investment Memo — Retail Acquisition

## Executive Summary

Meridian Advisors recommends the acquisition of the subject retail property located in **Midtown Manhattan** for a total consideration of **$15.0M**, representing a going-in cap rate of **5.75%** on current NOI.

## Property Overview

| Metric | Detail |
|--------|--------|
| **Location** | Midtown Manhattan, NY |
| **Asset Type** | Retail — Street-Level |
| **Gross SF** | 8,500 SF |
| **Floors** | Ground + Lower Level |
| **Year Built** | 1928, renovated 2019 |

## Financial Summary

- **Purchase Price:** $15,000,000 ($1,765/SF)
- **In-Place NOI:** $862,500
- **Going-in Cap Rate:** 5.75%
- **Stabilized NOI:** $975,000
- **Stabilized Cap Rate:** 6.50%

## Market Context

The Midtown Manhattan retail corridor continues to show resilient fundamentals. Average asking rents for ground-floor retail are **$275/SF**, with vacancy rates declining to **8.2%** from a peak of **12.5%** in 2023.

Comparable recent transactions in the submarket include:
- 520 Madison Ave — $18.5M (5.5% cap)
- 375 Park Ave — $12.0M (6.0% cap)

## Risk Factors

1. **Tenant Concentration** — Single-tenant asset; evaluate renewal probability
2. **Interest Rate Environment** — Rising rates may compress exit cap
3. **E-commerce Impact** — Monitor foot traffic and sales metrics

## Recommendation

**Proceed with acquisition** at the stated terms. The asset offers attractive basis relative to replacement cost and positions well for a value-add lease restructuring at renewal.

---
*CONFIDENTIAL — Meridian Advisory Group, LLC*
*Generated by AI Assistant • Verified by [ANALYST_NAME]*`;
  }

  if (taskType === 'email-draft' || query.toLowerCase().includes('email')) {
    return `**Subject: Follow-Up — Q4 Refinancing Terms and Next Steps**

Dear [CLIENT_NAME],

Thank you for the productive discussion last Thursday regarding the refinancing of your portfolio at [PROPERTY_ADDRESS]. I wanted to follow up with a summary of terms and proposed next steps.

Based on our conversations with three lenders, here is where we stand:

**Term Sheet Summary:**
- **Bank A:** 5-year fixed, 6.25% rate, 65% LTV, 1.25x DSCR minimum
- **Bank B:** 7-year fixed, 6.50% rate, 70% LTV, 1.20x DSCR minimum  
- **Bank C:** 10-year fixed, 6.75% rate, 60% LTV, 1.30x DSCR minimum

Given your stated priorities (maximizing proceeds while maintaining flexibility), we believe **Bank B's term sheet** offers the best balance of leverage, rate, and tenor.

**Recommended Next Steps:**
1. Confirm your preferred lender by end of week
2. Meridian will negotiate final terms and request a formal commitment
3. Target closing by Q4 end

Please let me know if you'd like to schedule a call to discuss further. Happy to walk through the analysis in detail.

Best regards,
[SENDER_NAME]
*Meridian Advisors*`;
  }

  if (query.toLowerCase().includes('cap rate') || query.toLowerCase().includes('market')) {
    return `## Midtown East Office — Cap Rate Analysis (Q4 2024)

Based on our knowledge base and recent transaction data:

**Average Cap Rates — Class A Office, Midtown East:**

| Quarter | Cap Rate | Trend |
|---------|----------|-------|
| Q4 2024 | 5.8% | ↓ -15bps |
| Q3 2024 | 5.95% | → Flat |
| Q2 2024 | 5.95% | ↑ +10bps |
| Q1 2024 | 5.85% | ↓ -20bps |

**Key Observations:**
- Cap rates have been compressing modestly, reflecting improved fundamentals
- **Vacancy** in Midtown East is at **11.2%**, down from **13.8%** a year ago
- **Asking rents** average **$82/SF**, up **3.4% YoY**
- Flight-to-quality continues — trophy assets trade 75-100bps tighter

**Notable Transactions:**
- 399 Park Ave — $425M (4.9% cap) — sovereign wealth buyer
- 245 Park Ave — recapitalization at 5.5% implied cap
- 601 Lexington — partial interest at 5.7% cap

> ⚠️ *Note: These figures are based on available market data in the knowledge base. For formal client deliverables, I recommend cross-referencing with CoStar/Real Capital Analytics for the most current data.*

Would you like me to expand this into a full market analysis report?`;
  }

  return `Thank you for your question. Here's what I found based on Meridian's shared knowledge base:

**Key Points:**
- I've searched across **1,247 indexed interactions** from the team
- Related conversations and documents have been referenced below

**Analysis:**
${query}

Based on the firm's institutional knowledge and current market conditions, here are my recommendations:

1. **Market Fundamentals** — Current indicators suggest stable conditions in the primary markets we cover
2. **Transaction Activity** — Volume has been picking up, particularly in the value-add segment
3. **Financing Environment** — Lender appetite remains selective but improving

**Sources from Knowledge Base:**
- Sarah Chen's deal memo on comparable transaction (2 weeks ago)
- Market analysis report generated for Q3 client presentation
- Michael Torres' lender communication notes

Would you like me to:
- 📄 **Create a Word document** from this analysis?
- 📧 **Draft an email** to share with the team?
- 🔍 **Search deeper** into the knowledge base for more context?`;
}
