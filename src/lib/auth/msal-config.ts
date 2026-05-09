/**
 * Auth Layer — MSAL Configuration
 * 
 * Configures Microsoft Authentication Library (MSAL) for:
 * - Browser: Interactive login via Entra ID popup/redirect
 * - Server: Token validation and on-behalf-of flows for Graph API
 */

import type { Configuration } from '@azure/msal-browser';

// Scopes needed for Microsoft Graph API operations
export const GRAPH_SCOPES = {
  /** Basic user profile */
  user: ['User.Read'],
  /** Email read/write/send */
  mail: ['Mail.ReadWrite', 'Mail.Send'],
  /** OneDrive/SharePoint file access */
  files: ['Files.ReadWrite.All'],
  /** SharePoint site access */
  sites: ['Sites.ReadWrite.All'],
  /** Calendar access */
  calendar: ['Calendars.ReadWrite'],
  /** Teams channel messages */
  teams: ['ChannelMessage.Send', 'Channel.ReadBasic.All'],
} as const;

/** All scopes needed for login — request them upfront */
export const LOGIN_SCOPES = [
  ...GRAPH_SCOPES.user,
  ...GRAPH_SCOPES.mail,
  ...GRAPH_SCOPES.files,
];

/** MSAL browser configuration for the React frontend */
export function getMsalConfig(): Configuration {
  return {
    auth: {
      clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
      authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID || 'common'}`,
      redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    },
    cache: {
      cacheLocation: 'sessionStorage',
    },
  };
}

/** Server-side MSAL configuration for API routes */
export const MSAL_SERVER_CONFIG = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'common'}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
  },
};
