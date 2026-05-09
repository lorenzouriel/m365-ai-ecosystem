/**
 * LLM Router — Model-Agnostic Request Routing
 * 
 * Routes requests to the appropriate LLM provider based on:
 * 1. Task type (simple tasks → cheaper model, complex → powerful)
 * 2. Configuration (swap default provider via .env)
 * 3. Automatic fallback if primary provider fails
 * 
 * This is the key architectural component that makes the system model-agnostic.
 * Swapping from Claude to OpenAI (or any future model) is a config change, not a code change.
 */

import type { LLMProvider, LLMOptions, LLMResponse, Message, StreamChunk, RouterConfig, TaskType } from './types';
import { ClaudeProvider } from './providers/claude';
import { OpenAIProvider } from './providers/openai';
import { LLMProviderError } from './providers/claude';

export class LLMRouter {
  private providers: Map<string, LLMProvider> = new Map();
  private config: RouterConfig;

  constructor(config?: Partial<RouterConfig>) {
    this.config = {
      primary: config?.primary || process.env.LLM_DEFAULT_PROVIDER || 'claude',
      fallback: config?.fallback || (process.env.LLM_DEFAULT_PROVIDER === 'openai' ? 'claude' : 'openai'),
      taskRouting: config?.taskRouting || {},
    };

    // Register default providers
    this.registerProvider(new ClaudeProvider());
    this.registerProvider(new OpenAIProvider());
  }

  /** Register a new LLM provider (extensibility point) */
  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.name, provider);
  }

  /** Get the list of available providers */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /** Get current routing configuration */
  getConfig(): RouterConfig {
    return { ...this.config };
  }

  /** Update routing config at runtime (e.g., from admin panel) */
  updateConfig(config: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Route a chat request to the appropriate provider.
   * Handles automatic fallback if the primary provider fails.
   */
  async chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse> {
    const provider = this.resolveProvider(options?.taskType);

    try {
      return await provider.chat(messages, options);
    } catch (error) {
      // Attempt fallback
      if (this.config.fallback && this.config.fallback !== provider.name) {
        console.warn(
          `[LLMRouter] Primary provider "${provider.name}" failed, falling back to "${this.config.fallback}"`,
          error instanceof Error ? error.message : error
        );
        const fallbackProvider = this.providers.get(this.config.fallback);
        if (fallbackProvider) {
          return fallbackProvider.chat(messages, options);
        }
      }
      throw error;
    }
  }

  /**
   * Route a streaming request to the appropriate provider.
   * Falls back to non-streaming chat if streaming fails.
   */
  async *stream(messages: Message[], options?: LLMOptions): AsyncIterable<StreamChunk> {
    const provider = this.resolveProvider(options?.taskType);

    try {
      yield* provider.stream(messages, options);
    } catch (error) {
      // Attempt fallback for streaming
      if (this.config.fallback && this.config.fallback !== provider.name) {
        console.warn(
          `[LLMRouter] Primary streaming provider "${provider.name}" failed, falling back to "${this.config.fallback}"`
        );
        const fallbackProvider = this.providers.get(this.config.fallback);
        if (fallbackProvider) {
          yield* fallbackProvider.stream(messages, options);
          return;
        }
      }
      throw error;
    }
  }

  /**
   * Resolve which provider should handle a given task.
   * Priority: task-specific routing → primary provider
   */
  private resolveProvider(taskType?: TaskType): LLMProvider {
    // Check task-specific routing first
    if (taskType && this.config.taskRouting?.[taskType]) {
      const taskProvider = this.providers.get(this.config.taskRouting[taskType]!);
      if (taskProvider) return taskProvider;
    }

    // Fall back to primary provider
    const primary = this.providers.get(this.config.primary);
    if (!primary) {
      throw new LLMProviderError(
        'router',
        `Primary provider "${this.config.primary}" not registered. Available: ${this.getAvailableProviders().join(', ')}`
      );
    }

    return primary;
  }
}

/** Singleton router instance */
let routerInstance: LLMRouter | null = null;

export function getRouter(): LLMRouter {
  if (!routerInstance) {
    routerInstance = new LLMRouter();
  }
  return routerInstance;
}
