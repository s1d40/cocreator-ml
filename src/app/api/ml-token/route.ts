import { NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/api-auth';
import { getMlTokenForClient, setMlTokenForClient } from '@/lib/user-store';

export async function GET(request: Request) {
  const auth = await verifyApiAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const clientId = auth.clientId;
  const token = getMlTokenForClient(clientId);

  return NextResponse.json({
    client_id: clientId,
    token: token || null,
    hasToken: !!token,
  });
}

export async function POST(request: Request) {
  const auth = await verifyApiAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const clientId = auth.clientId;

  try {
    const body = await request.json();
    if (typeof body.token === 'string') {
      const trimmedToken = body.token.trim();
      setMlTokenForClient(clientId, trimmedToken || null);
      return NextResponse.json({
        success: true,
        client_id: clientId,
        token: trimmedToken || null,
      });
    }
    return NextResponse.json({ error: 'Invalid token provided' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}
