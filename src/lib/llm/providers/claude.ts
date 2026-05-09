/**
 * Claude (Anthropic) Provider Adapter
 * 
 * Implements the LLMProvider interface for the Anthropic Claude API.
 * Handles message format conversion, streaming, and error handling.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, LLMOptions, LLMResponse, Message, StreamChunk } from '../types';

export class ClaudeProvider implements LLMProvider {
  readonly name = 'claude';
  readonly defaultModel: string;
  private client: Anthropic;

  constructor(apiKey?: string, defaultModel?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || 'dummy_key',
    });
    this.defaultModel = defaultModel || process.env.LLM_CLAUDE_MODEL || 'claude-sonnet-4-20250514';
  }

  async chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    // Separate system message from conversation messages
    const systemMessage = messages.find(m => m.role === 'system')?.content;
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP,
        stop_sequences: options?.stopSequences,
        system: systemMessage,
        messages: conversationMessages,
      });

      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => ('text' in block ? block.text : ''))
        .join('');

      return {
        content,
        model: response.model,
        provider: this.name,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'max_tokens',
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      throw new LLMProviderError(this.name, error);
    }
  }

  async *stream(messages: Message[], options?: LLMOptions): AsyncIterable<StreamChunk> {
    const model = options?.model || this.defaultModel;

    const systemMessage = messages.find(m => m.role === 'system')?.content;
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    try {
      const stream = this.client.messages.stream({
        model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP,
        stop_sequences: options?.stopSequences,
        system: systemMessage,
        messages: conversationMessages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield {
            content: event.delta.text,
            done: false,
          };
        }
      }

      // Final message with usage stats
      const finalMessage = await stream.finalMessage();
      yield {
        content: '',
        done: true,
        model: finalMessage.model,
        provider: this.name,
        usage: {
          promptTokens: finalMessage.usage.input_tokens,
          completionTokens: finalMessage.usage.output_tokens,
          totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
        },
      };
    } catch (error) {
      throw new LLMProviderError(this.name, error);
    }
  }
}

export class LLMProviderError extends Error {
  constructor(
    public provider: string,
    public cause: unknown,
  ) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`[${provider}] ${message}`);
    this.name = 'LLMProviderError';
  }
}
