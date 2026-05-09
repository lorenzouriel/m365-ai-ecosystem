'use client';

import React, { useState } from 'react';
import { Settings, Users, Brain, BarChart3, Shield, Key, RefreshCw, Save, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminTab = 'models' | 'users' | 'prompts' | 'analytics';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('models');
  const [primaryModel, setPrimaryModel] = useState('claude');
  const [claudeModel, setClaudeModel] = useState('claude-sonnet-4-20250514');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const tabs: { key: AdminTab; label: string; icon: typeof Settings }[] = [
    { key: 'models', label: 'Model Config', icon: Brain },
    { key: 'users', label: 'Users & Roles', icon: Users },
    { key: 'prompts', label: 'System Prompt', icon: Key },
    { key: 'analytics', label: 'Usage Analytics', icon: BarChart3 },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary" style={{ fontFamily: 'var(--font-heading)' }}>Admin Panel</h1>
          <p className="text-sm text-neutral-500 mt-1">Configure models, manage users, and monitor usage</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
          <Shield className="w-3 h-3" /> Admin Access
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl p-1 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex-1 justify-center',
              activeTab === tab.key ? 'bg-brand-primary text-white' : 'text-neutral-500 hover:bg-neutral-50')}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'models' && (
        <div className="space-y-6 animate-fade-in">
          {/* Model Router Config */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-brand-primary mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-accent" /> LLM Router Configuration
            </h2>
            <p className="text-xs text-neutral-500 mb-5">Swap the underlying model without changing any application code</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">Primary Provider</label>
                <select value={primaryModel} onChange={(e) => setPrimaryModel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 cursor-pointer">
                  <option value="claude">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">Fallback Provider</label>
                <div className="px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-500">
                  {primaryModel === 'claude' ? 'OpenAI (GPT)' : 'Anthropic (Claude)'} — automatic
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">Claude Model</label>
                <select value={claudeModel} onChange={(e) => setClaudeModel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 cursor-pointer">
                  <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Latest)</option>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-opus-4-20250514">Claude Opus 4</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">OpenAI Model</label>
                <select value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 cursor-pointer">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Changes take effect immediately for all users
              </div>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-medium hover:bg-brand-primary-light transition-colors cursor-pointer">
                {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Configuration</>}
              </button>
            </div>
          </div>

          {/* Task Routing */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-brand-primary mb-4">Task-Based Routing</h2>
            <div className="space-y-2">
              {taskRoutes.map((route) => (
                <div key={route.task} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{route.task}</p>
                    <p className="text-xs text-neutral-400">{route.description}</p>
                  </div>
                  <select defaultValue={route.provider}
                    className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none cursor-pointer">
                    <option value="primary">Use Primary</option>
                    <option value="claude">Always Claude</option>
                    <option value="openai">Always OpenAI</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-brand-primary mb-4">Team Members (25)</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.name} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-brand-primary">{user.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{user.name}</p>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                  </div>
                </div>
                <select defaultValue={user.role}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none cursor-pointer">
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prompts' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-brand-primary">System Prompt — v1.0.0</h2>
              <p className="text-xs text-neutral-500">Locked and version-controlled. Changes create a new version.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-medium">Active</span>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4 font-mono text-xs text-neutral-600 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
{`You are the AI assistant for Meridian Advisors, a commercial real estate advisory firm specializing in capital advisory (debt & equity), retail leasing, and office leasing.

## YOUR ROLE
- Senior real estate analyst and communication specialist
- Help draft documents, emails, deal memos, market analyses
- Provide institutional-quality output
- Learn from and contribute to shared knowledge base

## COMMUNICATION STYLE
- Professional yet approachable
- Concise and action-oriented
- Data-driven with industry terminology
- Cap rates, NOI, tenant mix, basis points

## GUARDRAILS
- Never fabricate financial data
- Never provide legal advice
- Maintain information barriers between clients
- Flag items requiring human judgment`}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsStats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-neutral-200 p-5">
                <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-brand-primary">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-brand-primary mb-4">Usage by Provider (Last 30 Days)</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-neutral-600">Claude Sonnet 4</span>
                  <span className="text-neutral-500">2,847 requests (78%)</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-neutral-600">GPT-4o (Fallback)</span>
                  <span className="text-neutral-500">803 requests (22%)</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-accent rounded-full" style={{ width: '22%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const taskRoutes = [
  { task: 'General Chat', description: 'Conversational AI interactions', provider: 'primary' },
  { task: 'Deal Memos', description: 'Investment memo generation', provider: 'primary' },
  { task: 'Email Drafting', description: 'Professional email composition', provider: 'primary' },
  { task: 'Summarization', description: 'Quick document summaries', provider: 'openai' },
  { task: 'Data Extraction', description: 'Structured data from documents', provider: 'openai' },
];

const users = [
  { name: 'Demo User', email: 'admin@meridian.com', role: 'admin' },
  { name: 'Sarah Chen', email: 'sarah.chen@meridian.com', role: 'analyst' },
  { name: 'Michael Torres', email: 'michael.torres@meridian.com', role: 'analyst' },
  { name: 'Emily Rodriguez', email: 'emily.rodriguez@meridian.com', role: 'analyst' },
  { name: 'James Park', email: 'james.park@meridian.com', role: 'viewer' },
];

const analyticsStats = [
  { label: 'Total Requests (30d)', value: '3,650', change: '+12% vs last month' },
  { label: 'Avg Response Time', value: '1.8s', change: '-0.3s improvement' },
  { label: 'Est. Monthly Cost', value: '$127.40', change: 'Within budget' },
];
