'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Search, Tag, Clock, User, MessageSquare, FileText, TrendingUp, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/lib/knowledge/types';

const categories = ['All', 'chat', 'deal-memo', 'email-draft', 'market-analysis'];

// Formatting helper
const formatType = (type: string) => {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const url = debouncedQuery ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : '/api/search';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Failed to fetch search results', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [debouncedQuery]);

  const filtered = results.filter(e => {
    return selectedCategory === 'All' || e.taskType === selectedCategory;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary" style={{ fontFamily: 'var(--font-heading)' }}>Knowledge Base</h1>
          <p className="text-sm text-neutral-500 mt-1">Shared organizational intelligence from all team interactions</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Search Active
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search across all team interactions, documents, and AI conversations..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/50 shadow-sm" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-neutral-400">
            <Brain className="w-3.5 h-3.5" /> Hybrid vector + keyword search
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto animate-fade-in" style={{ animationDelay: '150ms' }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedCategory === cat ? 'bg-brand-primary text-white' : 'bg-white border border-neutral-200 text-neutral-500 hover:border-brand-accent/30')}>
            {formatType(cat)}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3 relative min-h-[300px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/50 backdrop-blur-sm z-10 rounded-xl">
            <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-sm">
            No interactions found. Try chatting with the AI first to build the knowledge base!
          </div>
        ) : (
          filtered.map((entry, i) => (
            <div key={entry.id} className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:border-brand-accent/20 transition-all duration-300 animate-fade-in cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-brand-primary/5 text-[10px] font-semibold text-brand-primary">{formatType(entry.taskType)}</span>
                  <span className="flex items-center gap-1 text-xs text-neutral-400"><User className="w-3 h-3" />{entry.userId}</span>
                  <span className="flex items-center gap-1 text-xs text-neutral-400"><Clock className="w-3 h-3" />{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                {entry.relevanceScore !== undefined && (
                  <span className="text-[10px] font-medium text-brand-accent">{entry.relevanceScore}% match</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-1">{entry.userQuery}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-3 line-clamp-3">{entry.assistantResponse}</p>
              <div className="flex items-center gap-1.5">
                {entry.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] text-neutral-500">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
