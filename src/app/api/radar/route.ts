import { NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/api-auth';
import { getMonitoredCompetitors, setMonitoredCompetitors } from '@/lib/user-store';
import { MonitoredCompetitor } from '@/types/settings';

export async function GET(request: Request) {
  const auth = await verifyApiAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const monitoredCompetitors = getMonitoredCompetitors(auth.clientId);
  return NextResponse.json({
    client_id: auth.clientId,
    monitoredCompetitors,
  });
}

export async function POST(request: Request) {
  const auth = await verifyApiAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();
    if (Array.isArray(body.monitoredCompetitors)) {
      setMonitoredCompetitors(auth.clientId, body.monitoredCompetitors as MonitoredCompetitor[]);
      return NextResponse.json({
        success: true,
        client_id: auth.clientId,
        monitoredCompetitors: getMonitoredCompetitors(auth.clientId),
      });
    }
    return NextResponse.json({ error: 'Invalid competitors array provided' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update monitored competitors' }, { status: 400 });
  }
}
