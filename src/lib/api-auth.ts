import { NextResponse } from 'next/server';
import { getUnifiedSessionFromRequest, UnifiedSession } from '../auth';

export type ApiAuthResult =
  | { authenticated: true; session: UnifiedSession; clientId: string }
  | { authenticated: false; response: NextResponse; session: null; clientId: null };

/**
 * Validates request authentication for API route handlers.
 * Returns session and clientId if valid, or a 401 Unauthorized NextResponse if invalid.
 */
export async function verifyApiAuth(req: Request): Promise<ApiAuthResult> {
  const session = await getUnifiedSessionFromRequest(req);

  if (!session || !session.user || !session.user.client_id) {
    return {
      authenticated: false,
      session: null,
      clientId: null,
      response: NextResponse.json(
        { error: 'Unauthorized: Authentication required to access this resource.' },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    session,
    clientId: session.user.client_id,
  };
}
