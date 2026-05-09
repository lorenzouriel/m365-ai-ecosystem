/**
 * Word Service — Microsoft Graph Word/OneDrive Operations
 * 
 * Create, read, and manage Word documents via Microsoft Graph API.
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { graphRequest } from './client';

export interface WordDocument {
  id: string;
  name: string;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  size: number;
}

export interface CreateDocumentOptions {
  /** File name (without extension) */
  name: string;
  /** Markdown content to convert to Word format */
  content: string;
  /** OneDrive folder path (default: root) */
  folder?: string;
}

export class WordService {
  constructor(private client: Client) {}

  /**
   * List recent Word documents from the user's OneDrive
   */
  async listDocuments(top: number = 20): Promise<WordDocument[]> {
    const result = await graphRequest<{ value: WordDocument[] }>(
      this.client,
      '/me/drive/root/search(q=\'.docx\')',
      {
        query: {
          '$top': String(top),
          '$orderby': 'lastModifiedDateTime desc',
          '$select': 'id,name,webUrl,createdDateTime,lastModifiedDateTime,size',
        },
      }
    );
    return result.value;
  }

  /**
   * Create a new Word document in OneDrive.
   * Uploads HTML content which Word Online renders natively.
   */
  async createDocument(options: CreateDocumentOptions): Promise<WordDocument> {
    const { name, content, folder } = options;
    const htmlContent = this.markdownToHtml(content);
    const fileName = `${name}.docx`;

    const path = folder
      ? `/me/drive/root:/${folder}/${fileName}:/content`
      : `/me/drive/root:/${fileName}:/content`;

    // Upload as HTML — OneDrive/Word Online will convert to docx
    const result = await graphRequest<WordDocument>(
      this.client,
      path,
      {
        method: 'PUT',
        body: htmlContent,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

    return result;
  }

  /**
   * Get a document's content as text
   */
  async getDocumentContent(itemId: string): Promise<string> {
    const result = await graphRequest<string>(
      this.client,
      `/me/drive/items/${itemId}/content`,
    );
    return result;
  }

  /**
   * Get a document's metadata
   */
  async getDocument(itemId: string): Promise<WordDocument> {
    return graphRequest<WordDocument>(
      this.client,
      `/me/drive/items/${itemId}`,
      {
        query: {
          '$select': 'id,name,webUrl,createdDateTime,lastModifiedDateTime,size',
        },
      }
    );
  }

  /**
   * Simple Markdown to HTML conversion for Word document creation.
   * Applies branded styling inline for consistent output.
   */
  private markdownToHtml(markdown: string): string {
    let html = markdown
      // Headers
      .replace(/^### (.+)$/gm, '<h3 style="color:#1B3A5C;font-family:Georgia,serif;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="color:#1B3A5C;font-family:Georgia,serif;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="color:#1B3A5C;font-family:Georgia,serif;">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Bullet lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p style="font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;">')
      // Line breaks
      .replace(/\n/g, '<br/>');

    // Wrap list items
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul style="margin-left:20px;">$&</ul>');

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1, h2, h3 { color: #1B3A5C; font-family: Georgia, serif; }
    h1 { font-size: 18pt; border-bottom: 2px solid #C9A96E; padding-bottom: 8px; }
    h2 { font-size: 14pt; }
    h3 { font-size: 12pt; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background-color: #1B3A5C; color: white; }
  </style>
</head>
<body>
  <p style="font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;">${html}</p>
</body>
</html>`;
  }
}
