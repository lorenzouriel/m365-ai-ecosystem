'use client';

import React, { useState } from 'react';
import { Mail, Send, Inbox, Search, Paperclip, Sparkles, Plus, ArrowLeft, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Email {
  id: string; from: string; subject: string; preview: string; time: string; read: boolean;
  hasAttachment: boolean; body: string;
}

const emails: Email[] = [
  { id: '1', from: 'David Chen', subject: 'RE: 200 Park Ave — Updated LOI Terms', preview: 'The seller has come back with revised terms on the LOI...', time: '10:32 AM', read: false, hasAttachment: true, body: 'Hi team,\n\nThe seller revised LOI terms:\n1. Purchase price reduced to $12.2M\n2. Due diligence extended to 60 days\n3. Earnest money deposit increased to $500K\n\nCan we discuss strategy before responding?\n\nBest,\nDavid' },
  { id: '2', from: 'Jennifer Walsh', subject: 'Q4 Refinancing — Lender Term Sheets', preview: 'Attached are the three term sheets. Bank B looks strongest...', time: '9:15 AM', read: false, hasAttachment: true, body: 'Team,\n\nTerm sheets received:\n• Bank A: 5yr, 6.25%, 65% LTV\n• Bank B: 7yr, 6.50%, 70% LTV\n• Bank C: 10yr, 6.75%, 60% LTV\n\nBank B strongest on leverage.\n\nJennifer' },
  { id: '3', from: 'Marcus Rodriguez', subject: 'South Florida Market Report — Draft', preview: 'Please review the attached draft before client delivery...', time: 'Yesterday', read: true, hasAttachment: true, body: 'Please review the SoFla retail report draft.\n\nKey findings:\n• Rents up 4.2% YoY\n• Vacancy at 4.8%\n• Strong absorption in Brickell\n\nComments due Thursday.\n\nMarcus' },
  { id: '4', from: 'Sarah Kim', subject: 'New Client — Beacon Capital', preview: 'Great intro call. Looking for retail acquisitions $10-25M...', time: 'Yesterday', read: true, hasAttachment: false, body: 'Intro call with Beacon Capital:\n• Retail acquisitions NYC, $10-25M\n• Prefer stabilized with credit tenants\n• Close Q1 next year\n\nWill set up a presentation.\n\nSarah' },
  { id: '5', from: 'Alex Turner', subject: 'WeWork 1 WTC — Lease Renewal', preview: 'WeWork interested in renewing sublease, modified terms...', time: '2 days ago', read: true, hasAttachment: false, body: 'WeWork wants to renew at 1 WTC:\n• Reduce SF by 15%\n• 3-year extension vs standard 5\n• Budget tighter, expect TI push\n\nWe have leverage given limited alternatives.\n\nAlex' },
];

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeBody, setComposeBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiDraft = async () => {
    setIsGenerating(true);
    const draft = `Dear [CLIENT_NAME],\n\nThank you for discussing the Q4 refinancing terms. Based on our analysis, we've identified three competitive structures that could optimize your debt profile while maintaining flexibility.\n\nI'd recommend a 30-minute call this week to walk through the options. Would Thursday afternoon work?\n\nBest regards,\n[SENDER_NAME]\nMeridian Advisors`;
    let acc = '';
    for (const char of draft) { acc += char; setComposeBody(acc); await new Promise(r => setTimeout(r, 6)); }
    setIsGenerating(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Mail className="w-4.5 h-4.5 text-brand-accent" />
          <h1 className="text-sm font-semibold text-brand-primary">Email Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setActiveTab('inbox'); setSelectedEmail(null); }}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              activeTab === 'inbox' ? 'bg-brand-primary text-white' : 'text-neutral-500 hover:bg-neutral-100')}>
            <Inbox className="w-3.5 h-3.5" /> Inbox
          </button>
          <button onClick={() => { setActiveTab('compose'); setSelectedEmail(null); }}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              activeTab === 'compose' ? 'bg-brand-primary text-white' : 'text-neutral-500 hover:bg-neutral-100')}>
            <Plus className="w-3.5 h-3.5" /> Compose
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'compose' ? (
          <div className="flex-1 p-6 bg-neutral-50">
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-neutral-100 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-neutral-500 w-12">To:</label>
                  <input type="text" placeholder="recipient@example.com" className="flex-1 text-sm focus:outline-none" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-neutral-500 w-12">Subject:</label>
                  <input type="text" placeholder="Email subject" className="flex-1 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="p-5">
                <button onClick={handleAiDraft} disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 mb-3 bg-brand-accent/10 text-brand-accent-dark rounded-lg text-xs font-medium hover:bg-brand-accent/20 transition-colors disabled:opacity-50 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5" /> {isGenerating ? 'Generating...' : 'AI Draft'}
                </button>
                <textarea value={composeBody} onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Start typing or click 'AI Draft'..." rows={14}
                  className="w-full text-sm text-neutral-700 resize-none focus:outline-none leading-relaxed" />
              </div>
              <div className="p-4 border-t border-neutral-100 flex items-center justify-end bg-neutral-50">
                <button className="flex items-center gap-2 px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary-light transition-colors cursor-pointer">
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          </div>
        ) : selectedEmail ? (
          <div className="flex-1 p-6 bg-neutral-50 animate-fade-in">
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setSelectedEmail(null)}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-primary mb-4 transition-colors cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Inbox
              </button>
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-brand-primary mb-3">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-brand-primary">{selectedEmail.from.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{selectedEmail.from}</p>
                    <p className="text-xs text-neutral-400">{selectedEmail.time}</p>
                  </div>
                </div>
                <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{selectedEmail.body}</div>
                <div className="mt-6 flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-medium cursor-pointer"><Reply className="w-3.5 h-3.5" /> Reply</button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent/10 text-brand-accent-dark rounded-lg text-xs font-medium cursor-pointer"><Sparkles className="w-3.5 h-3.5" /> AI Reply</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-neutral-100 bg-white sticky top-0 z-10">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search emails..." className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30" />
              </div>
            </div>
            <div className="divide-y divide-neutral-100">
              {emails.map((email, i) => (
                <button key={email.id} onClick={() => setSelectedEmail(email)}
                  className={cn('w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-neutral-50 transition-colors cursor-pointer animate-fade-in', !email.read && 'bg-brand-primary/[0.02]')}
                  style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-brand-primary">{email.from.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn('text-sm', !email.read ? 'font-semibold text-neutral-800' : 'text-neutral-600')}>{email.from}</span>
                      {email.hasAttachment && <Paperclip className="w-3 h-3 text-neutral-400 shrink-0" />}
                    </div>
                    <p className={cn('text-sm truncate', !email.read ? 'font-medium text-neutral-700' : 'text-neutral-500')}>{email.subject}</p>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{email.preview}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-neutral-400">{email.time}</span>
                    {!email.read && <div className="w-2 h-2 rounded-full bg-brand-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
