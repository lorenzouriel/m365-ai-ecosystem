'use client';

import React from 'react';
import {
  MessageSquare,
  FileText,
  Mail,
  Brain,
  TrendingUp,
  Clock,
  Users,
  ArrowUpRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard Page
 * 
 * Overview of AI usage, recent interactions, quick actions, and team activity.
 */
export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-brand-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          Good evening, Demo User
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Here&apos;s what&apos;s happening across Meridian Advisors AI
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:border-brand-accent/20
                       transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-brand-primary/5 flex items-center justify-center">
                <stat.icon className="w-4.5 h-4.5 text-brand-primary" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.changeColor}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-brand-primary">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-brand-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-brand-primary/5 flex items-center justify-center
                                  group-hover:bg-brand-accent/10 transition-colors">
                    <action.icon className="w-4 h-4 text-brand-primary group-hover:text-brand-accent transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-700">{action.label}</p>
                    <p className="text-xs text-neutral-400">{action.description}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-brand-accent transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Interactions */}
        <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-brand-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-accent" />
                Recent Team Interactions
              </h2>
              <Link href="/knowledge" className="text-xs text-brand-accent hover:text-brand-accent-dark transition-colors">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {recentInteractions.map((interaction, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <interaction.icon className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-neutral-700">{interaction.user}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
                        {interaction.type}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 truncate">{interaction.query}</p>
                    <p className="text-xs text-neutral-400 mt-1">{interaction.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Model Status */}
      <div className="mt-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="bg-brand-primary-dark rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Brain className="w-4 h-4 text-brand-accent" />
              System Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {systemStatus.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.statusColor}`} />
                  <div>
                    <p className="text-xs text-neutral-400">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Static Demo Data ────────────────────────────────────────────

const stats = [
  { icon: MessageSquare, label: 'AI Conversations Today', value: '47', change: '+12%', changeColor: 'bg-green-50 text-green-600' },
  { icon: FileText, label: 'Documents Generated', value: '18', change: '+8%', changeColor: 'bg-green-50 text-green-600' },
  { icon: Users, label: 'Active Team Members', value: '22/25', change: '88%', changeColor: 'bg-blue-50 text-blue-600' },
  { icon: TrendingUp, label: 'Knowledge Base Entries', value: '1,247', change: '+156', changeColor: 'bg-amber-50 text-amber-600' },
];

const quickActions = [
  { icon: MessageSquare, label: 'New AI Chat', description: 'Start a conversation', href: '/chat' },
  { icon: FileText, label: 'Create Document', description: 'Draft a deal memo or report', href: '/documents' },
  { icon: Mail, label: 'Draft Email', description: 'Compose a client email', href: '/email' },
  { icon: Brain, label: 'Search Knowledge', description: 'Find firm intelligence', href: '/knowledge' },
];

const recentInteractions = [
  {
    icon: FileText,
    user: 'Sarah Chen',
    type: 'Deal Memo',
    query: 'Generated investment memo for 200 Park Ave retail acquisition ($12.5M, 5.8% cap)',
    time: '12 minutes ago',
  },
  {
    icon: Mail,
    user: 'Michael Torres',
    type: 'Email Draft',
    query: 'Drafted follow-up to Blackstone regarding Q4 refinancing terms',
    time: '28 minutes ago',
  },
  {
    icon: MessageSquare,
    user: 'Emily Rodriguez',
    type: 'Chat',
    query: 'What were the average cap rates for Class A office in Midtown East last quarter?',
    time: '45 minutes ago',
  },
  {
    icon: Brain,
    user: 'James Park',
    type: 'Market Analysis',
    query: 'Generated South Florida retail market overview for client presentation',
    time: '1 hour ago',
  },
  {
    icon: FileText,
    user: 'Demo User',
    type: 'Document',
    query: 'Created tenant representation proposal for WeWork sublease at 1 WTC',
    time: '2 hours ago',
  },
];

const systemStatus = [
  { label: 'Primary Model', value: 'Claude Sonnet 4', statusColor: 'bg-green-400 animate-pulse' },
  { label: 'Fallback Model', value: 'GPT-4o', statusColor: 'bg-green-400' },
  { label: 'Knowledge Base', value: 'Azure AI Search', statusColor: 'bg-green-400' },
  { label: 'M365 Connection', value: 'Microsoft Graph', statusColor: 'bg-green-400' },
];
