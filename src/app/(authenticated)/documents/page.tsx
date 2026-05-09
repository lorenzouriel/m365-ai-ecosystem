'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Download,
  ExternalLink,
  Clock,
  Filter,
  LayoutGrid,
  List,
  FileSpreadsheet,
  Presentation,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type DocType = 'all' | 'memo' | 'report' | 'proposal' | 'template';

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<DocType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.type === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary" style={{ fontFamily: 'var(--font-heading)' }}>
            Documents
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            AI-generated documents connected to your OneDrive &amp; SharePoint
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-lg
                           text-sm font-medium hover:bg-brand-primary-light transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Create Document
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/50"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
          {docTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                filter === type.value
                  ? 'bg-brand-primary text-white'
                  : 'text-neutral-500 hover:text-brand-primary hover:bg-neutral-50'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 bg-white border border-neutral-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'grid' ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-neutral-600'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-neutral-600'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Grid/List */}
      <div className={cn(
        'animate-fade-in',
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-2'
      )} style={{ animationDelay: '200ms' }}>
        {filteredDocs.map((doc) => (
          viewMode === 'grid' ? (
            <DocumentCard key={doc.id} doc={doc} />
          ) : (
            <DocumentRow key={doc.id} doc={doc} />
          )
        ))}
      </div>
    </div>
  );
}

function DocumentCard({ doc }: { doc: typeof documents[0] }) {
  const Icon = getDocIcon(doc.format);
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:border-brand-accent/20
                    transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center
                        group-hover:bg-brand-accent/10 transition-colors">
          <Icon className="w-5 h-5 text-brand-primary group-hover:text-brand-accent transition-colors" />
        </div>
        <div className="flex items-center gap-1">
          {doc.aiGenerated && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-accent/10 text-[10px] font-medium text-brand-accent">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          )}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-brand-primary mb-1 truncate">{doc.name}</h3>
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{doc.description}</p>
      <div className="flex items-center justify-between text-[10px] text-neutral-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {doc.modified}
        </span>
        <div className="flex items-center gap-1.5">
          <button className="p-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer" title="Download">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer" title="Open in M365">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentRow({ doc }: { doc: typeof documents[0] }) {
  const Icon = getDocIcon(doc.format);
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg border border-neutral-200 px-4 py-3
                    hover:shadow-sm hover:border-brand-accent/20 transition-all duration-200 group">
      <Icon className="w-5 h-5 text-brand-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-neutral-700 truncate">{doc.name}</h3>
        <p className="text-xs text-neutral-400 truncate">{doc.description}</p>
      </div>
      {doc.aiGenerated && (
        <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-accent/10 text-[10px] font-medium text-brand-accent">
          <Sparkles className="w-2.5 h-2.5" /> AI Generated
        </span>
      )}
      <span className="shrink-0 text-xs text-neutral-400">{doc.modified}</span>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded hover:bg-neutral-100 transition-colors cursor-pointer"><Download className="w-3.5 h-3.5 text-neutral-400" /></button>
        <button className="p-1.5 rounded hover:bg-neutral-100 transition-colors cursor-pointer"><ExternalLink className="w-3.5 h-3.5 text-neutral-400" /></button>
      </div>
    </div>
  );
}

function getDocIcon(format: string) {
  switch (format) {
    case 'xlsx': return FileSpreadsheet;
    case 'pptx': return Presentation;
    default: return FileText;
  }
}

const docTypes: { label: string; value: DocType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Deal Memos', value: 'memo' },
  { label: 'Reports', value: 'report' },
  { label: 'Proposals', value: 'proposal' },
  { label: 'Templates', value: 'template' },
];

const documents = [
  { id: '1', name: '200 Park Ave — Investment Memo', description: 'Retail acquisition analysis, $12.5M at 5.8% cap rate', type: 'memo' as DocType, format: 'docx', modified: '2h ago', aiGenerated: true },
  { id: '2', name: 'Q4 2024 Market Report — Midtown East', description: 'Comprehensive market overview for Class A office', type: 'report' as DocType, format: 'docx', modified: '1d ago', aiGenerated: true },
  { id: '3', name: 'WeWork Sublease Proposal — 1 WTC', description: 'Tenant representation proposal and financial analysis', type: 'proposal' as DocType, format: 'docx', modified: '2d ago', aiGenerated: true },
  { id: '4', name: 'Deal Memo Template v3', description: 'Standard investment memo template with branded formatting', type: 'template' as DocType, format: 'docx', modified: '1w ago', aiGenerated: false },
  { id: '5', name: 'South Florida Retail Analysis', description: 'Market overview and investment thesis for SoFla retail', type: 'report' as DocType, format: 'docx', modified: '3d ago', aiGenerated: true },
  { id: '6', name: 'Client Portfolio Summary — Q4', description: 'Consolidated portfolio performance for top-10 clients', type: 'report' as DocType, format: 'xlsx', modified: '5d ago', aiGenerated: false },
  { id: '7', name: 'Capital Markets Pitch Deck', description: 'Branded pitch presentation for new client meetings', type: 'proposal' as DocType, format: 'pptx', modified: '1w ago', aiGenerated: false },
  { id: '8', name: '601 Lexington — Lease Abstract', description: 'Office lease summary and key terms extraction', type: 'memo' as DocType, format: 'docx', modified: '4d ago', aiGenerated: true },
];
