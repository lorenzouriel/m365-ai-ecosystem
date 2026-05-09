import { CosmosClient } from '@azure/cosmos';
import fs from 'fs/promises';
import path from 'path';
import type { InteractionLog } from './types';

const MOCK_DB_PATH = path.join(process.cwd(), '.next', 'mock-cosmos-db.json');

let cosmosClient: CosmosClient | null = null;
const dbName = 'm365-ai-platform';
const containerName = 'interactions';

if (process.env.AZURE_COSMOS_CONNECTION_STRING) {
  try {
    cosmosClient = new CosmosClient(process.env.AZURE_COSMOS_CONNECTION_STRING);
  } catch (error) {
    console.warn('Failed to initialize Cosmos DB client. Falling back to mock DB.');
  }
}

/**
 * Logs an interaction to Cosmos DB (or local mock if no connection string).
 */
export async function logInteraction(log: Omit<InteractionLog, 'id' | 'timestamp'>): Promise<InteractionLog> {
  const fullLog: InteractionLog = {
    ...log,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  if (cosmosClient) {
    try {
      const database = cosmosClient.database(dbName);
      const container = database.container(containerName);
      await container.items.create(fullLog);
      return fullLog;
    } catch (error) {
      console.error('Cosmos DB Insert Error:', error);
      // Fallback to mock if Cosmos fails
    }
  }

  // Fallback: Write to local JSON file for the demo
  try {
    let currentLogs: InteractionLog[] = [];
    try {
      const data = await fs.readFile(MOCK_DB_PATH, 'utf-8');
      currentLogs = JSON.parse(data);
    } catch (e) {
      // File doesn't exist yet, which is fine
    }

    currentLogs.push(fullLog);
    // Ensure directory exists
    await fs.mkdir(path.dirname(MOCK_DB_PATH), { recursive: true });
    await fs.writeFile(MOCK_DB_PATH, JSON.stringify(currentLogs, null, 2));
  } catch (err) {
    console.error('Failed to write to mock Cosmos DB:', err);
  }

  return fullLog;
}

/**
 * Retrieves interactions for a user (useful for history).
 */
export async function getUserInteractions(userId: string): Promise<InteractionLog[]> {
  if (cosmosClient) {
    try {
      const database = cosmosClient.database(dbName);
      const container = database.container(containerName);
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.timestamp DESC',
          parameters: [{ name: '@userId', value: userId }]
        })
        .fetchAll();
      return resources as InteractionLog[];
    } catch (error) {
      console.error('Cosmos DB Query Error:', error);
    }
  }

  // Fallback
  try {
    const data = await fs.readFile(MOCK_DB_PATH, 'utf-8');
    const logs: InteractionLog[] = JSON.parse(data);
    return logs
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    return [];
  }
}
