import { redirect } from 'next/navigation';
import { getUnifiedSession, getUnifiedSessionFromRequest, UnifiedSession } from '../auth';

/**
 * Constructs login redirect URL for cocreator-core HUB.
 */
export function getHubLoginUrl(returnUrl?: string): string {
  const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 'https://hub.cocreator.com';
  const cleanHubUrl = hubUrl.endsWith('/') ? hubUrl.slice(0, -1) : hubUrl;

  if (returnUrl) {
    return `${cleanHubUrl}/login?returnTo=${encodeURIComponent(returnUrl)}`;
  }
  return `${cleanHubUrl}/login`;
}

/**
 * Enforces unified session authentication for Server Components or Server Actions.
 * If unauthenticated, redirects to NEXT_PUBLIC_HUB_URL/login?returnTo=...
 */
export async function requireAuth(returnUrl?: string): Promise<UnifiedSession> {
  const session = await getUnifiedSession();

  if (!session || !session.user || !session.user.client_id) {
    const loginUrl = getHubLoginUrl(returnUrl);
    redirect(loginUrl);
  }

  return session;
}

/**
 * Enforces authentication from Request context and redirects if unauthenticated.
 */
export async function requireAuthFromRequest(req: Request): Promise<UnifiedSession> {
  const session = await getUnifiedSessionFromRequest(req);

  if (!session || !session.user || !session.user.client_id) {
    const loginUrl = getHubLoginUrl(req.url);
    redirect(loginUrl);
  }

  return session;
}
