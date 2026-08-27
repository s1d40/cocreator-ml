import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { endpoint, method = 'GET', token, body } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }

    const targetUrl = endpoint.startsWith('http')
      ? endpoint
      : `https://api.mercadolibre.com/${endpoint.replace(/^\//, '')}`;

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(targetUrl, fetchOptions);
    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('ML Proxy Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal proxy error' },
      { status: 500 }
    );
  }
}
