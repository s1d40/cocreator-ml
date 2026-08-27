import { NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/api-auth';
import { getUserSettings, updateUserSettings } from '@/lib/user-store';

export async function GET(request: Request) {
  const auth = await verifyApiAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const settings = getUserSettings(auth.clientId);
  return NextResponse.json({
    client_id: auth.clientId,
    settings,
  });
}

export async function POST(request: Request) {
  const auth = await verifyApiAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload provided' }, { status: 400 });
    }

    const updated = updateUserSettings(auth.clientId, body);
    return NextResponse.json({
      success: true,
      client_id: auth.clientId,
      settings: updated,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 400 });
  }
}
