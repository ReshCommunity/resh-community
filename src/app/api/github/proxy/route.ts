import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!path) {
    return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  }

  try {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Resh-Community-CMS',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from GitHub API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!path) {
    return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`https://api.github.com${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Resh-Community-CMS',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to post to GitHub API' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!path) {
    return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`https://api.github.com${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Resh-Community-CMS',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to put to GitHub API' },
      { status: 500 }
    );
  }
}
