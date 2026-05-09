'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ArrowRight,
  Shield,
  Brain,
  FileText,
  Mail,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';

/**
 * Landing / Login Page
 * 
 * Premium landing page with demo brand (Meridian Advisors).
 * In production, clicking "Sign in" triggers MSAL popup.
 * For demo, we simulate auth and redirect to dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    // In production: trigger MSAL login popup
    // For demo: simulate auth delay and redirect
    await new Promise(resolve => setTimeout(resolve, 1200));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Accent Line */}
      <div className="accent-line" />

      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-brand-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              Meridian Advisors
            </h1>
            <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 -mt-0.5">
              AI Platform
            </p>
          </div>
        </div>

        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg
                     text-sm font-medium hover:bg-brand-primary-light transition-all duration-200
                     hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          <Shield className="w-4 h-4" />
          {isSigningIn ? 'Connecting...' : 'Sign in with Microsoft'}
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 -mt-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            <span className="text-xs font-medium text-brand-accent-dark">
              Powered by Claude &amp; Microsoft 365
            </span>
          </div>

          <h2
            className="text-5xl md:text-6xl font-bold text-brand-primary mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your firm&apos;s intelligence,
            <br />
            <span className="text-brand-accent">unified &amp; amplified</span>
          </h2>

          <p className="text-lg text-neutral-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            An AI-powered workspace that connects to your Microsoft 365 environment.
            Draft documents, compose emails, search your institutional knowledge base —
            all with branded, professional output.
          </p>

          {/* CTA */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-xl
                       text-base font-semibold hover:bg-brand-primary-light transition-all duration-200
                       hover:shadow-xl hover:shadow-brand-primary/20 hover:-translate-y-0.5
                       disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
          >
            {isSigningIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating via Entra ID...
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Feature Cards */}
        <div className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-4 w-full">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group p-6 bg-white rounded-xl border border-neutral-200 hover:border-brand-accent/30
                         hover:shadow-lg hover:shadow-brand-accent/5 transition-all duration-300
                         hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-4
                              group-hover:bg-brand-accent/10 transition-colors duration-300">
                <feature.icon className="w-5 h-5 text-brand-primary group-hover:text-brand-accent transition-colors duration-300" />
              </div>
              <h3 className="text-sm font-semibold text-brand-primary mb-1.5">{feature.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Architecture Highlights */}
        <div className="max-w-4xl mx-auto mt-16 mb-12 px-4 w-full">
          <div className="p-8 rounded-2xl bg-brand-primary-dark text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Zap className="w-5 h-5 text-brand-accent" />
                Architecture Highlights
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {architecturePoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-neutral-300 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-neutral-400">
          <span>© 2025 Meridian Advisory Group, LLC — Demo Project</span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            SSO via Microsoft Entra ID
          </span>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: 'AI Chat Assistant',
    description: 'Converse with an AI that understands real estate — backed by your firm\'s shared knowledge base.',
  },
  {
    icon: FileText,
    title: 'Document Generation',
    description: 'Create deal memos, market analyses, and reports in branded Word format with one click.',
  },
  {
    icon: Mail,
    title: 'Email Intelligence',
    description: 'Draft professional client emails, summarize threads, and manage your Outlook from one place.',
  },
  {
    icon: BarChart3,
    title: 'Knowledge Base',
    description: 'Every interaction enriches a shared knowledge base that makes the whole team smarter.',
  },
];

const architecturePoints = [
  'LLM-agnostic: swap Claude for OpenAI (or any model) via config — no code changes',
  'Microsoft Entra ID SSO with role-based access control (admin, analyst, viewer)',
  'Shared knowledge base via Azure AI Search — all 25 users contribute to firm intelligence',
  'Branded output templates locked on all AI-generated documents and emails',
  'Azure-native infrastructure provisioned via Bicep (IaC) in your own tenant',
  'Real-time streaming responses with full interaction logging and indexing',
];
