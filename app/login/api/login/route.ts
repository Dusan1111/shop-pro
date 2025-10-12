// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { verifyPassword } from '@/lib/auth';
import { clientPromise, settingsDbName } from '@/lib/mongodb';
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
    const settingsDb = client.db(settingsDbName);
    const user = await settingsDb.collection('Users').findOne({ email }) as any;

    if (!user) {
      return NextResponse.json({ error: 'Korisničko ime ili lozinka nisu validni!'}, { status: 401 });
    }
    // Verify password using bcrypt
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Korisničko ime ili lozinka nisu validni!'}, { status: 401 });
    }

    // Lookup role if user has roleId
    let roleName = null;
    if (user.roleId) {
      const role = await settingsDb.collection('Roles').findOne({ _id: user.roleId }) as any;
      if (role) {
        roleName = role.name;
      }
    }
    let tenantName = null;
    if (user.tenantId) {
      const tenant = await settingsDb.collection('Tenants').findOne({ _id: user.tenantId }) as any;
      if (tenant) {
        tenantName = tenant.name;
      }
    }
    if (!user.tenantId) {
      const token = jwt.sign({
        userId: user._id,
        isSuperAdmin: true,
        dbName: settingsDbName,
        role: roleName,
        fullName: user.fullName || user.email,
        tenantName: tenantName
      }, JWT_SECRET, { expiresIn: '7d' });
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
    }

    // Regular user - lookup tenant by tenantId to get dbName
    const tenant = await settingsDb.collection('Tenants').findOne({ _id: user.tenantId }) as any;
    if (!tenant || !tenant.dbName) {
      return NextResponse.json({ error: 'Ne postoji baza podataka za datu kompaniju'}, { status: 500 });
    }

    const token = jwt.sign({
      userId: user._id,
      tenantId: user.tenantId,
      dbName: tenant.dbName,
      role: roleName,
      fullName: user.fullName || user.email,
      tenantName: tenant.name
    }, JWT_SECRET, { expiresIn: '7d' });
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
