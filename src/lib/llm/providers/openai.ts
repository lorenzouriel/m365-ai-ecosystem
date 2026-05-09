/**
 * OpenAI Provider Adapter
 * 
 * Implements the LLMProvider interface for the OpenAI API.
 * Drop-in replacement for Claude — swap via config without code changes.
 */

import OpenAI from 'openai';
import type { LLMProvider, LLMOptions, LLMResponse, Message, StreamChunk } from '../types';
import { LLMProviderError } from './claude';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  readonly defaultModel: string;
  private client: OpenAI;

  constructor(apiKey?: string, defaultModel?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || 'dummy_key',
    });
    this.defaultModel = defaultModel || process.env.LLM_OPENAI_MODEL || 'gpt-4o';
  }

  async chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: openaiMessages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP,
        stop: options?.stopSequences,
      });

      const choice = response.choices[0];

      return {
        content: choice.message.content || '',
        model: response.model,
        provider: this.name,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        finishReason: choice.finish_reason === 'stop' ? 'stop' : 'max_tokens',
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      throw new LLMProviderError(this.name, error);
    }
  }

  async *stream(messages: Message[], options?: LLMOptions): AsyncIterable<StreamChunk> {
    const model = options?.model || this.defaultModel;

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: openaiMessages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP,
        stop: options?.stopSequences,
        stream: true,
        stream_options: { include_usage: true },
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        const isFinished = chunk.choices[0]?.finish_reason !== null && chunk.choices[0]?.finish_reason !== undefined;

        if (delta?.content) {
          yield {
            content: delta.content,
            done: false,
          };
        }

        if (isFinished && chunk.usage) {
          yield {
            content: '',
            done: true,
            model: chunk.model,
            provider: this.name,
            usage: {
              promptTokens: chunk.usage.prompt_tokens,
              completionTokens: chunk.usage.completion_tokens,
              totalTokens: chunk.usage.total_tokens,
            },
          };
        }
      }
    } catch (error) {
      throw new LLMProviderError(this.name, error);
    }
  }
}
