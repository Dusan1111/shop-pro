// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });

  const response = NextResponse.json({ message: 'Uspešno ste se izlogovali!' });
  response.headers.set('Set-Cookie', cookie);
  return response;
}
