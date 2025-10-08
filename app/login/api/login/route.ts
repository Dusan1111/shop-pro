// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { verifyPassword } from '@/lib/auth';
import { clientPromise, dbName } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const client = await clientPromise;
    const db = client.db(dbName);
    const user = await db.collection('Users').findOne({ email }) as any;
    
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Korisničko ime ili lozinka nisu validni!'}, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    const response = NextResponse.json({ message: 'Uspešno logovanje!' });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Greška prilikom logovanja:', error);
    return NextResponse.json({ error: error}, { status: 500 });
  }
}
