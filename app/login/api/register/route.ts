// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth';
import { clientPromise, dbName } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, name } = parsed.data;
    const client = await clientPromise;
    const db = client.db(dbName);
    const existingUserEmail = await db.collection('Users').findOne({ email });
    const existingUserPassword = await db.collection('Users').findOne({ password });
    
    if (existingUserEmail) {
      return NextResponse.json({ error: 'Email je zauzet!' }, { status: 409 });
    } 
    if (existingUserPassword) {
      return NextResponse.json({ error: 'Lozinka je zauzeta!' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = { email, name, password: hashedPassword };
    await db.collection('Users').insertOne(newUser);

    return NextResponse.json({ message: 'Korisnik uspešno registrovan.' }, { status: 201 });
  } catch (error) {
    console.error('Greška prilikom registracije:', error);
    return NextResponse.json({ error:'Greška prilikom registracije:' + error }, { status: 500 });
  }
}
