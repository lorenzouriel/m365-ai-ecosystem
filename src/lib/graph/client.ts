/**
 * Microsoft Graph Client
 * 
 * Initializes and manages the Microsoft Graph client for M365 operations.
 * Uses the on-behalf-of (OBO) flow for delegated user access.
 */

import { Client } from '@microsoft/microsoft-graph-client';

/**
 * Create an authenticated Graph client using a user's access token.
 */
export function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

/**
 * Graph API error handler with retry logic.
 */
export async function graphRequest<T>(
  client: Client,
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    body?: unknown;
    headers?: Record<string, string>;
    query?: Record<string, string>;
  }
): Promise<T> {
  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let request = client.api(path);

      // Apply query parameters
      if (options?.query) {
        for (const [key, value] of Object.entries(options.query)) {
          request = request.query({ [key]: value });
        }
      }

      // Apply custom headers
      if (options?.headers) {
        request = request.headers(options.headers);
      }

      // Execute based on method
      switch (options?.method || 'GET') {
        case 'POST':
          return await request.post(options?.body);
        case 'PATCH':
          return await request.patch(options?.body);
        case 'PUT':
          return await request.put(options?.body);
        case 'DELETE':
          return await request.delete();
        default:
          return await request.get();
      }
    } catch (error: unknown) {
      lastError = error;

      // Check for throttling (429) — wait and retry
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        if (statusCode === 429 && attempt < maxRetries) {
          const retryAfter = 1000 * attempt; // Exponential backoff
          console.warn(`[Graph] Throttled on ${path}, retrying in ${retryAfter}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
          continue;
        }
      }

      // Don't retry on client errors (4xx except 429)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        if (statusCode >= 400 && statusCode < 500) {
          throw error;
        }
      }

      // Retry on server errors (5xx)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }
  }

  throw lastError;
}
