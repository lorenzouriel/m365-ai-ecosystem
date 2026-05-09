import { NextRequest } from 'next/server';
import { getRouter } from '@/lib/llm/router';
import { SYSTEM_PROMPT, PROMPT_TEMPLATES, type PromptTemplateKey } from '@/lib/llm/system-prompt';
import type { Message, TaskType } from '@/lib/llm/types';
import { logInteraction } from '@/lib/knowledge/db';
import { searchKnowledgeBase, indexInteraction } from '@/lib/knowledge/search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages: userMessages, taskType = 'chat' } = body as {
      messages: Array<{ role: string; content: string }>;
      taskType?: TaskType;
    };

    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastUserMessage = userMessages[userMessages.length - 1].content;
    const augmentedMessages: Message[] = [];

    // 1. System prompt (base + task-specific)
    let systemContent = SYSTEM_PROMPT;
    if (taskType in PROMPT_TEMPLATES) {
      systemContent += '\n\n' + PROMPT_TEMPLATES[taskType as PromptTemplateKey];
    }
    augmentedMessages.push({ role: 'system', content: systemContent });

    // 2. RAG context injection from Azure AI Search
    try {
      const ragResults = await searchKnowledgeBase(lastUserMessage, { limit: 3 });
      if (ragResults && ragResults.length > 0) {
        let contextBlock = `## Relevant Context from Meridian Knowledge Base\n\n`;
        ragResults.forEach((doc, i) => {
          contextBlock += `[Interaction ${i + 1}] - ${doc.timestamp}\nUser Asked: ${doc.userQuery}\nAI Responded: ${doc.assistantResponse}\n\n`;
        });
        augmentedMessages.push({
          role: 'system',
          content: contextBlock,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch RAG context', e);
    }

    // 3. Conversation history
    for (const msg of userMessages) {
      augmentedMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }

    // 4. Stream response from LLM router
    const router = getRouter();
    let stream;
    try {
      stream = router.stream(augmentedMessages, { taskType: taskType as TaskType });
    } catch (e) {
      // Fallback stream generator if API keys are missing or routing fails
      stream = (async function* () {
        const fallbackText = "This is a simulated AI response from the Memory Layer pipeline. The real LLM API keys are missing in the local environment, but this interaction is still being logged to Cosmos DB and indexed in Azure AI Search for the RAG pipeline.\n\n" + 
          (taskType === 'deal-memo' ? "# Investment Memo\n\nAcquisition recommended." : "Here is the information you requested about " + lastUserMessage);
        
        for (const char of fallbackText) {
          yield { content: char, done: false, model: 'simulated-model', provider: 'simulated' };
          await new Promise(r => setTimeout(r, 10)); // Add artificial delay
        }
        yield { content: '', done: true, model: 'simulated-model', provider: 'simulated' };
      })();
    }

    // Create a ReadableStream that forwards chunks and logs the interaction when done
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        let finalModel = 'unknown';
        let finalProvider = 'unknown';

        try {
          const encoder = new TextEncoder();
          for await (const chunk of stream) {
            if (chunk.content) {
              fullResponse += chunk.content;
              controller.enqueue(encoder.encode(chunk.content));
            }
            if (chunk.model) finalModel = chunk.model;
            if (chunk.provider) finalProvider = chunk.provider;

            if (chunk.done) {
              // Fire and forget logging
              Promise.resolve().then(async () => {
                try {
                  const log = await logInteraction({
                    userId: 'demo-user', // Mock user for now
                    sessionId: 'session-' + Date.now(),
                    taskType,
                    userQuery: lastUserMessage,
                    assistantResponse: fullResponse,
                    model: finalModel,
                    provider: finalProvider,
                    tags: [taskType, 'auto-logged'],
                  });
                  // Index for future RAG
                  await indexInteraction(log);
                  console.log('[Memory Layer] Interaction logged and indexed:', log.id);
                } catch (e) {
                  console.error('Failed to log interaction', e);
                }
              });
            }
          }
          controller.close();
        } catch (error) {
          console.error('[Chat API] Streaming loop error, falling back to basic stream:', error);
          
          let fallbackText = "### Simulated Response (API Key Missing)\n\nThis is a local simulated response because the OpenAI/Anthropic API keys are not configured in your environment.\n\n";
          
          if (taskType === 'email-draft') {
            fallbackText += `**Subject**: Following up on ${lastUserMessage}\n\nHi Jake,\n\nI hope this email finds you well. I wanted to follow up regarding the recent developments and outline our next steps.\n\nLet me know when you have time for a quick call to discuss this further.\n\nBest regards,\n\n[Your Name]\nMeridian Advisors`;
          } else if (taskType === 'deal-memo') {
            fallbackText += `**Executive Summary**\nBased on the query regarding ${lastUserMessage}, the asset presents a compelling value-add opportunity with strong fundamentals in a growing submarket.`;
          } else {
            fallbackText += `Here is the information you requested about **${lastUserMessage}**. The RAG pipeline has successfully intercepted this query, and it is being logged to Cosmos DB and Azure AI Search.`;
          }

          // Stream the fallback text chunk by chunk to simulate generation
          const encoder = new TextEncoder();
          for (let i = 0; i < fallbackText.length; i += 5) {
            const chunk = fallbackText.substring(i, i + 5);
            controller.enqueue(encoder.encode(chunk));
            await new Promise(resolve => setTimeout(resolve, 20));
          }
          
          controller.close();
          
          await logInteraction({
            userId: 'demo-user',
            sessionId: 'session-' + Date.now(),
            taskType,
            userQuery: lastUserMessage,
            assistantResponse: fallbackText,
            model: 'simulated-fallback',
            provider: 'simulated',
            tags: [taskType, 'auto-logged', 'fallback'],
          }).then(log => indexInteraction(log)).catch(console.error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
