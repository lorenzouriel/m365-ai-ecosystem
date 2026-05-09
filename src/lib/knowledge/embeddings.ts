import OpenAI from 'openai';

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generates an embedding vector for a given text string.
 * Uses text-embedding-3-small (dimensions: 1536).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim() === '') {
    return new Array(1536).fill(0);
  }

  if (openai) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '), // Openai recommends replacing newlines for better embeddings
        dimensions: 1536,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate real embedding:', error);
    }
  }

  // Fallback: Generate a deterministic pseudo-random mock embedding for demo purposes
  // This allows the local demo to run without hitting API limits
  console.log('[Mock] Generating mock embedding');
  const mockEmbedding = new Array(1536).fill(0);
  
  // Simple hash to make the mock embedding loosely deterministic based on text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  
  for (let i = 0; i < 1536; i++) {
    mockEmbedding[i] = (Math.sin(hash + i) + 1) / 2; // Normalize to 0-1
  }
  
  // Normalize vector to length 1
  const magnitude = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
  return mockEmbedding.map(val => val / magnitude);
}

/**
 * Utility to extract searchable text from an interaction log.
 */
export function extractTextForEmbedding(userQuery: string, assistantResponse: string): string {
  return `User Query: ${userQuery}\n\nAI Response: ${assistantResponse}`;
}
