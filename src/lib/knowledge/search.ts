import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import fs from 'fs/promises';
import path from 'path';
import type { InteractionLog, SearchResult } from './types';
import { generateEmbedding, extractTextForEmbedding } from './embeddings';

const indexName = 'interactions-index';
let searchClient: SearchClient<any> | null = null;

if (process.env.AZURE_SEARCH_ENDPOINT && process.env.AZURE_SEARCH_KEY) {
  try {
    searchClient = new SearchClient(
      process.env.AZURE_SEARCH_ENDPOINT,
      indexName,
      new AzureKeyCredential(process.env.AZURE_SEARCH_KEY)
    );
  } catch (error) {
    console.warn('Failed to initialize Azure AI Search client. Falling back to mock.');
  }
}

// For mock local search
const MOCK_INDEX_PATH = path.join(process.cwd(), '.next', 'mock-search-index.json');

/**
 * Pushes a new interaction log to the Azure AI Search index.
 * Generates an embedding before pushing.
 */
export async function indexInteraction(log: InteractionLog): Promise<void> {
  const contentToVectorize = extractTextForEmbedding(log.userQuery, log.assistantResponse);
  const embedding = await generateEmbedding(contentToVectorize);

  const document = {
    id: log.id,
    userId: log.userId,
    sessionId: log.sessionId,
    taskType: log.taskType,
    userQuery: log.userQuery,
    assistantResponse: log.assistantResponse,
    timestamp: log.timestamp,
    tags: log.tags,
    contentVector: embedding,
  };

  if (searchClient) {
    try {
      await searchClient.uploadDocuments([document]);
      return;
    } catch (error) {
      console.error('Azure Search Upload Error:', error);
    }
  }

  // Fallback: mock local vector index
  try {
    let index: any[] = [];
    try {
      const data = await fs.readFile(MOCK_INDEX_PATH, 'utf-8');
      index = JSON.parse(data);
    } catch (e) {
      // File doesn't exist
    }

    index.push(document);
    await fs.mkdir(path.dirname(MOCK_INDEX_PATH), { recursive: true });
    await fs.writeFile(MOCK_INDEX_PATH, JSON.stringify(index, null, 2));
  } catch (err) {
    console.error('Failed to write to mock search index:', err);
  }
}

export interface SearchOptions {
  limit?: number;
  userRole?: 'admin' | 'analyst' | 'viewer';
  userId?: string;
}

/**
 * Performs a hybrid search (vector + keyword) against the knowledge base.
 * Applies RBAC guardrails to ensure users only see permitted interactions.
 */
export async function searchKnowledgeBase(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  const { limit = 5, userRole = 'viewer', userId = 'demo-user' } = options;
  const queryVector = await generateEmbedding(query);

  // Search Guardrails Logic
  // Admins see everything. Analysts see non-restricted. Viewers see only their own or public.
  let odataFilter = '';
  if (userRole === 'viewer') {
    odataFilter = `userId eq '${userId}' or tags/any(t: t eq 'public')`;
  } else if (userRole === 'analyst') {
    odataFilter = `not tags/any(t: t eq 'restricted-admin')`;
  }

  if (searchClient) {
    try {
      const searchResults = await searchClient.search(query, {
        top: limit,
        filter: odataFilter || undefined,
        vectorSearchOptions: {
          queries: [
            {
              kind: 'vector',
              vector: queryVector,
              kNearestNeighborsCount: limit,
              fields: ['contentVector'],
              weight: 0.8, // Hybrid search weights
            }
          ]
        },
        // Boost keyword matching on recent documents
        scoringProfile: 'recency-boost',
        select: ['id', 'userId', 'sessionId', 'taskType', 'userQuery', 'assistantResponse', 'timestamp', 'tags']
      });

      const results: SearchResult[] = [];
      for await (const result of searchResults.results) {
        results.push({
          id: result.document.id,
          userId: result.document.userId,
          sessionId: result.document.sessionId,
          taskType: result.document.taskType,
          userQuery: result.document.userQuery,
          assistantResponse: result.document.assistantResponse,
          timestamp: result.document.timestamp,
          tags: result.document.tags,
          model: 'unknown',
          provider: 'unknown',
          relevanceScore: result.score
        });
      }
      return results;
    } catch (error) {
      console.error('Azure Search Query Error:', error);
    }
  }

  // Fallback: mock vector search using simple cosine similarity on the local file
  try {
    const data = await fs.readFile(MOCK_INDEX_PATH, 'utf-8');
    let index: any[] = JSON.parse(data);

    // Apply Mock Guardrails
    if (userRole === 'viewer') {
      index = index.filter(doc => doc.userId === userId || doc.tags.includes('public'));
    } else if (userRole === 'analyst') {
      index = index.filter(doc => !doc.tags.includes('restricted-admin'));
    }

    // Compute cosine similarity for each document
    const scoredDocs = index.map(doc => {
      let dotProduct = 0;
      let queryMag = 0;
      let docMag = 0;
      for (let i = 0; i < queryVector.length; i++) {
        dotProduct += queryVector[i] * doc.contentVector[i];
        queryMag += queryVector[i] * queryVector[i];
        docMag += doc.contentVector[i] * doc.contentVector[i];
      }
      const similarity = docMag === 0 || queryMag === 0 ? 0 : dotProduct / (Math.sqrt(queryMag) * Math.sqrt(docMag));
      
      // Keyword boost hack for the mock
      const keywordMatch = doc.userQuery.toLowerCase().includes(query.toLowerCase()) || 
                           doc.assistantResponse.toLowerCase().includes(query.toLowerCase());
      
      return { ...doc, score: similarity + (keywordMatch ? 0.2 : 0) };
    });

    // Sort by score and take top K
    scoredDocs.sort((a, b) => b.score - a.score);
    const topDocs = scoredDocs.slice(0, limit);

    return topDocs.map(doc => ({
      id: doc.id,
      userId: doc.userId,
      sessionId: doc.sessionId,
      taskType: doc.taskType,
      userQuery: doc.userQuery,
      assistantResponse: doc.assistantResponse,
      timestamp: doc.timestamp,
      tags: doc.tags,
      model: 'unknown',
      provider: 'unknown',
      relevanceScore: Math.round(Math.min(doc.score * 100, 99)) // Format as percentage
    }));
  } catch (e) {
    return []; // No index yet or read error
  }
}
