import { NextResponse } from 'next/server';
import { authenticate, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const user = await authenticate(username, password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken({ username: user.username });

    const response = NextResponse.json({ success: true, username: user.username });
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}
