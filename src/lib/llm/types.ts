/**
 * LLM Provider Abstraction Layer
 * 
 * Provider-agnostic interfaces for the orchestration engine.
 * Any LLM can be plugged in by implementing the LLMProvider interface.
 */

export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  /** Metadata for logging and routing decisions */
  taskType?: TaskType;
  /** User ID for interaction logging */
  userId?: string;
  /** Session ID for conversation threading */
  sessionId?: string;
}

export type TaskType =
  | 'chat'
  | 'email-draft'
  | 'document-draft'
  | 'deal-memo'
  | 'market-analysis'
  | 'summarization'
  | 'data-extraction';

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'max_tokens' | 'error';
  latencyMs: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  /** Only present on the final chunk */
  usage?: TokenUsage;
  model?: string;
  provider?: string;
}

/**
 * Core interface that every LLM provider must implement.
 * This is the contract that makes the system model-agnostic.
 */
export interface LLMProvider {
  readonly name: string;
  readonly defaultModel: string;

  /** Send a chat completion request and get a full response */
  chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse>;

  /** Send a chat completion request and stream the response */
  stream(messages: Message[], options?: LLMOptions): AsyncIterable<StreamChunk>;
}

/**
 * Router configuration for model selection and fallback.
 */
export interface RouterConfig {
  /** Primary provider name */
  primary: string;
  /** Fallback provider name (used when primary fails) */
  fallback?: string;
  /** Task-specific overrides: route certain tasks to specific providers */
  taskRouting?: Partial<Record<TaskType, string>>;
}

/**
 * Interaction log entry for the shared knowledge base.
 */
export interface InteractionLog {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  taskType: TaskType;
  userMessage: string;
  assistantResponse: string;
  model: string;
  provider: string;
  usage: TokenUsage;
  latencyMs: number;
  /** RAG context that was injected */
  contextSources?: string[];
  /** Auto-detected categories */
  tags?: string[];
}
