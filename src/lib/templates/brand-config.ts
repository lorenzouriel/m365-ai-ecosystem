/**
 * Brand Configuration — Meridian Advisors (Demo Company)
 * 
 * Centralized brand definition used by:
 * - Web portal (CSS variables, components)
 * - Document templates (Word, PowerPoint)
 * - Email templates (HTML signatures)
 * 
 * In production, this would be loaded from Azure Blob Storage
 * to allow admin configuration without code changes.
 */

export const BRAND = {
  name: 'Meridian Advisors',
  tagline: 'Real Estate Advisory + Capital Markets',
  
  colors: {
    /** Deep navy — primary brand color, headings, nav */
    primary: '#1B3A5C',
    /** Warm gold — accent, CTAs, highlights */
    accent: '#C9A96E',
    /** Lighter gold for hover states */
    accentLight: '#D4B87A',
    /** Rich charcoal for body text */
    text: '#2D3748',
    /** Medium gray for secondary text */
    textMuted: '#718096',
    /** Light gray for borders and dividers */
    border: '#E2E8F0',
    /** Off-white for page backgrounds */
    background: '#F7FAFC',
    /** Pure white for cards and panels */
    surface: '#FFFFFF',
    /** Dark navy for dark mode / sidebar */
    surfaceDark: '#0F2337',
    /** Success green */
    success: '#38A169',
    /** Warning amber */
    warning: '#D69E2E',
    /** Error red */
    error: '#E53E3E',
  },

  fonts: {
    /** Display headings — elegant serif */
    heading: "'Georgia', 'Times New Roman', serif",
    /** Body text — clean sans-serif */
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    /** Code and data — monospace */
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  },

  /** Company details for document headers/footers */
  company: {
    legalName: 'Meridian Advisory Group, LLC',
    website: 'www.meridianadvisors.com',
    email: 'info@meridianadvisors.com',
    phone: '+1 (212) 555-0100',
    offices: [
      { city: 'New York', address: '445 Park Avenue, Suite 3B, New York, NY 10022' },
      { city: 'Miami', address: '1200 Brickell Avenue, Suite 1800, Miami, FL 33131' },
    ],
  },

  /** Document formatting standards */
  documents: {
    headerColor: '#1B3A5C',
    accentRule: '#C9A96E',
    bodyFont: 'Calibri',
    headingFont: 'Georgia',
    fontSize: '11pt',
    lineHeight: '1.6',
    confidentialLabel: 'CONFIDENTIAL — Meridian Advisors',
  },
} as const;

export type BrandConfig = typeof BRAND;
