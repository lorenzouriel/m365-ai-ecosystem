/**
 * Outlook Service — Microsoft Graph Mail Operations
 * 
 * Draft, send, read, and search emails via Microsoft Graph API.
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { graphRequest } from './client';

export interface EmailMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  body: { contentType: string; content: string };
  from: { emailAddress: { name: string; address: string } };
  toRecipients: Array<{ emailAddress: { name: string; address: string } }>;
  receivedDateTime: string;
  isRead: boolean;
  importance: 'low' | 'normal' | 'high';
  hasAttachments: boolean;
}

export interface DraftEmailOptions {
  to: Array<{ name?: string; address: string }>;
  cc?: Array<{ name?: string; address: string }>;
  subject: string;
  body: string;
  /** 'html' or 'text' */
  bodyType?: 'html' | 'text';
  importance?: 'low' | 'normal' | 'high';
}

export interface SendEmailOptions extends DraftEmailOptions {
  /** If true, save to sent items */
  saveToSentItems?: boolean;
}

export class OutlookService {
  constructor(private client: Client) {}

  /**
   * Get recent inbox messages
   */
  async getInbox(top: number = 20): Promise<EmailMessage[]> {
    const result = await graphRequest<{ value: EmailMessage[] }>(
      this.client,
      '/me/mailFolders/inbox/messages',
      {
        query: {
          '$top': String(top),
          '$orderby': 'receivedDateTime desc',
          '$select': 'id,subject,bodyPreview,from,toRecipients,receivedDateTime,isRead,importance,hasAttachments',
        },
      }
    );
    return result.value;
  }

  /**
   * Get a specific email message with full body
   */
  async getMessage(messageId: string): Promise<EmailMessage> {
    return graphRequest<EmailMessage>(
      this.client,
      `/me/messages/${messageId}`,
    );
  }

  /**
   * Create a draft email (saved in Drafts folder, not sent)
   */
  async createDraft(options: DraftEmailOptions): Promise<EmailMessage> {
    const message = this.buildMessagePayload(options);

    return graphRequest<EmailMessage>(
      this.client,
      '/me/messages',
      {
        method: 'POST',
        body: message,
      }
    );
  }

  /**
   * Send an email directly
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    const message = this.buildMessagePayload(options);

    await graphRequest(
      this.client,
      '/me/sendMail',
      {
        method: 'POST',
        body: {
          message,
          saveToSentItems: options.saveToSentItems ?? true,
        },
      }
    );
  }

  /**
   * Reply to an existing email
   */
  async reply(messageId: string, comment: string): Promise<void> {
    await graphRequest(
      this.client,
      `/me/messages/${messageId}/reply`,
      {
        method: 'POST',
        body: { comment },
      }
    );
  }

  /**
   * Search emails by query
   */
  async searchMail(query: string, top: number = 10): Promise<EmailMessage[]> {
    const result = await graphRequest<{ value: EmailMessage[] }>(
      this.client,
      '/me/messages',
      {
        query: {
          '$search': `"${query}"`,
          '$top': String(top),
          '$select': 'id,subject,bodyPreview,from,toRecipients,receivedDateTime,isRead',
        },
      }
    );
    return result.value;
  }

  /**
   * Build a Graph API message payload from our options interface
   */
  private buildMessagePayload(options: DraftEmailOptions) {
    return {
      subject: options.subject,
      body: {
        contentType: options.bodyType === 'text' ? 'Text' : 'HTML',
        content: options.body,
      },
      toRecipients: options.to.map(r => ({
        emailAddress: { name: r.name || r.address, address: r.address },
      })),
      ccRecipients: options.cc?.map(r => ({
        emailAddress: { name: r.name || r.address, address: r.address },
      })) || [],
      importance: options.importance || 'normal',
    };
  }
}
