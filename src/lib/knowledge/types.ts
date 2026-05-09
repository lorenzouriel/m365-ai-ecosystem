export interface InteractionLog {
  id: string;
  userId: string;
  sessionId: string;
  taskType: string;
  userQuery: string;
  assistantResponse: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: string;
  tags: string[];
}

export interface SearchResult extends InteractionLog {
  relevanceScore?: number;
}
