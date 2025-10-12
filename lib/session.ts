// lib/session.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserDb } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  userId: string;
  tenantId?: string;
  dbName: string;
  isSuperAdmin?: boolean;
  role?: string | null;
  fullName?: string;
  tenantName?: string | null;
  permissions?: string[];
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Get user's database from token
export async function getUserDbFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const db = await getUserDb(payload.dbName);
  return {
    db,
    userId: payload.userId,
    tenantId: payload.tenantId,
    dbName: payload.dbName,
    isSuperAdmin: payload.isSuperAdmin || false,
    role: payload.role || null,
    fullName: payload.fullName || null
  };
}
