import { NextResponse } from 'next/server';

// In-memory token store for session fallback / demo mode
let storedToken: string | null = process.env.MERCADO_LIBRE_ACCESS_TOKEN || null;

export async function GET() {
  return NextResponse.json({
    token: storedToken || null,
    hasToken: !!storedToken,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.token === 'string') {
      storedToken = body.token.trim();
      return NextResponse.json({ success: true, token: storedToken });
    }
    return NextResponse.json({ error: 'Invalid token provided' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}
