import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledgeBase } from '@/lib/knowledge/search';
import { getUserInteractions } from '@/lib/knowledge/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      // If no query, return recent interactions for the user
      // In a real app, userId would come from the auth token
      const recent = await getUserInteractions('demo-user');
      return NextResponse.json(recent.slice(0, limit));
    }

    const role = searchParams.get('role') as 'admin' | 'analyst' | 'viewer' || 'viewer';

    // Perform hybrid vector search
    const results = await searchKnowledgeBase(query, { limit, userRole: role });
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
