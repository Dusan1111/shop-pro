import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({
      userId: payload.userId,
      tenantId: payload.tenantId,
      dbName: payload.dbName,
      isSuperAdmin: payload.isSuperAdmin || false,
      role: payload.role || null,
      fullName: payload.fullName || null,
      tenantName: payload.tenantName || null
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
