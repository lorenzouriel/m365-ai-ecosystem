/**
 * Auth Provider — React Context for MSAL Authentication
 * 
 * Wraps the application with MsalProvider and provides
 * convenient hooks for login/logout/token operations.
 */

'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  type AccountInfo,
  type SilentRequest,
} from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { getMsalConfig, LOGIN_SCOPES } from './msal-config';

// ─── Types ───────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: (scopes?: string[]) => Promise<string>;
}

// ─── Context ─────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  getAccessToken: async () => '',
});

export const useAuth = () => useContext(AuthContext);

// ─── MSAL Instance ──────────────────────────────────────────────────

let msalInstance: PublicClientApplication | null = null;

function getMsalInstance(): PublicClientApplication {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(getMsalConfig());
  }
  return msalInstance;
}

// ─── Inner Provider (has access to MSAL hooks) ──────────────────────

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts } = useMsal();
  const isMsalAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract user info from MSAL account
  useEffect(() => {
    if (isMsalAuthenticated && accounts.length > 0) {
      const account = accounts[0];
      setUser(extractUser(account));
      setIsLoading(false);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [isMsalAuthenticated, accounts]);

  const login = useCallback(async () => {
    try {
      await instance.loginPopup({
        scopes: LOGIN_SCOPES,
        prompt: 'select_account',
      });
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw error;
    }
  }, [instance]);

  const logout = useCallback(async () => {
    try {
      await instance.logoutPopup();
      setUser(null);
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
    }
  }, [instance]);

  const getAccessToken = useCallback(
    async (scopes: string[] = LOGIN_SCOPES): Promise<string> => {
      if (accounts.length === 0) throw new Error('No authenticated account');

      const request: SilentRequest = {
        scopes,
        account: accounts[0],
      };

      try {
        const response = await instance.acquireTokenSilent(request);
        return response.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          const response = await instance.acquireTokenPopup(request);
          return response.accessToken;
        }
        throw error;
      }
    },
    [instance, accounts]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isMsalAuthenticated,
        isLoading,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Root Provider ──────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const msalInstance = getMsalInstance();

  return (
    <MsalProvider instance={msalInstance}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </MsalProvider>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function extractUser(account: AccountInfo): AuthUser {
  // Extract role from Entra ID token claims (custom claim or group membership)
  const roles = (account.idTokenClaims?.roles as string[]) || [];
  let role: UserRole = 'viewer';
  if (roles.includes('admin') || roles.includes('Admin')) {
    role = 'admin';
  } else if (roles.includes('analyst') || roles.includes('Analyst')) {
    role = 'analyst';
  }

  return {
    id: account.localAccountId,
    name: account.name || 'Unknown User',
    email: account.username || '',
    role,
  };
}
