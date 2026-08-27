import { NextRequest } from 'next/server';

export interface UnifiedUser {
  id: string;
  client_id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface UnifiedSession {
  user: UnifiedUser;
  expires?: string;
  token?: string;
}

const COOKIE_NAMES = [
  'cocreator_session',
  'session',
  'auth_token',
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
  'sb-access-token',
  'jwt',
  'token',
];

/**
 * Safely decodes base64 string handling utf-8 characters.
 */
function base64Decode(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    if (typeof atob === 'function') {
      const decoded = atob(padded);
      return decodeURIComponent(
        decoded
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf-8');
    }
  } catch {
    try {
      if (typeof atob === 'function') return atob(str);
      if (typeof Buffer !== 'undefined') return Buffer.from(str, 'base64').toString('utf-8');
    } catch {
      // ignore
    }
  }
  return str;
}

/**
 * Parses JWT or Base64 JSON token and extracts unified session user.
 */
export function decodeUnifiedSession(token: string): UnifiedSession | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const trimmedToken = token.trim();
  if (!trimmedToken) return null;

  let payload: any = null;

  // Try parsing as JWT (header.payload.signature)
  const parts = trimmedToken.split('.');
  if (parts.length === 3) {
    try {
      const decodedString = base64Decode(parts[1]);
      payload = JSON.parse(decodedString);
    } catch {
      payload = null;
    }
  }

  // If not JWT or payload parse failed, try parsing directly or from base64 string
  if (!payload) {
    try {
      payload = JSON.parse(trimmedToken);
    } catch {
      try {
        const decodedString = base64Decode(trimmedToken);
        payload = JSON.parse(decodedString);
      } catch {
        payload = null;
      }
    }
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  // Check token expiration if exp claim is present (in seconds)
  if (typeof payload.exp === 'number') {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTimestamp) {
      return null;
    }
  }

  // Extract client_id (Core unified session identifier)
  const clientId =
    payload.client_id ||
    payload.clientId ||
    payload.user?.client_id ||
    payload.sub ||
    payload.user_id ||
    payload.userId ||
    payload.id ||
    payload.user?.id;

  if (!clientId) {
    return null;
  }

  const userId = payload.id || payload.sub || payload.user_id || payload.user?.id || clientId;
  const email = payload.email || payload.user?.email || `${clientId}@cocreator.evaluate`;
  const name = payload.name || payload.user?.name || payload.email?.split('@')[0] || `User_${clientId.slice(0, 6)}`;
  const role = payload.role || payload.user?.role || 'user';

  const user: UnifiedUser = {
    id: String(userId),
    client_id: String(clientId),
    email: String(email),
    name: String(name),
    role: String(role),
  };

  const expires = payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined;

  return {
    user,
    expires,
    token: trimmedToken,
  };
}

/**
 * Extract token from Request cookies or Authorization header.
 */
export function extractTokenFromRequest(req: Request | NextRequest): string | null {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // Check Cookie header
  const cookieHeader = req.headers.get('cookie') || req.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, cookieStr) => {
      const [name, ...value] = cookieStr.trim().split('=');
      if (name) acc[name] = value.join('=');
      return acc;
    }, {});

    for (const cookieName of COOKIE_NAMES) {
      if (cookies[cookieName]) {
        return cookies[cookieName];
      }
    }
  }

  return null;
}

/**
 * Gets unified session from an incoming Request / NextRequest.
 */
export async function getUnifiedSessionFromRequest(req: Request | NextRequest): Promise<UnifiedSession | null> {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  return decodeUnifiedSession(token);
}

/**
 * Gets unified session from App Router cookies context (for Server Components / Route Handlers).
 */
export async function getUnifiedSession(): Promise<UnifiedSession | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();

    for (const cookieName of COOKIE_NAMES) {
      const cookieVal = cookieStore.get(cookieName)?.value;
      if (cookieVal) {
        const session = decodeUnifiedSession(cookieVal);
        if (session) return session;
      }
    }
  } catch {
    // Next.js headers/cookies context unavailable (e.g. outside request cycle)
  }

  return null;
}
