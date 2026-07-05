/**
 * Cookie-based session: signed JSON payload carrying { role, userId, name }.
 *
 * Backwards compatible with the legacy admin cookie (signed plain string "admin"):
 * verify() will detect it and return { role: 'admin', userId: 'admin', name: 'admin' }.
 */
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET ?? 'change-me';
export const COOKIE = 'mzali_session';
export const LEGACY_COOKIE = 'mzali_admin';

export type Role = 'admin' | 'employee';
export type Session = { role: Role; userId: string; name: string };

function hmac(value: string): string {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

export function sign(value: string): string {
  return `${value}.${hmac(value)}`;
}

export function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const i = signed.lastIndexOf('.');
  if (i < 0) return null;
  const value = signed.slice(0, i);
  const sig = signed.slice(i + 1);
  const expected = hmac(value);
  const A = Buffer.from(sig);
  const B = Buffer.from(expected);
  if (A.length !== B.length) return null;
  return crypto.timingSafeEqual(A, B) ? value : null;
}

export function signSession(s: Session): string {
  return sign(JSON.stringify(s));
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const sessionCookie = store.get(COOKIE)?.value;
  const verified = verify(sessionCookie);
  if (verified) {
    try {
      const parsed = JSON.parse(verified) as Session;
      if (parsed && (parsed.role === 'admin' || parsed.role === 'employee') && parsed.userId) return parsed;
    } catch { /* fall through */ }
  }
  // Legacy cookie support — used to be sign('admin')
  const legacy = store.get(LEGACY_COOKIE)?.value;
  if (verify(legacy) === 'admin') {
    return { role: 'admin', userId: 'admin', name: 'admin' };
  }
  return null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getSession())?.role === 'admin';
}

export async function isEmployee(): Promise<boolean> {
  return (await getSession())?.role === 'employee';
}

export async function currentUserId(): Promise<string | null> {
  return (await getSession())?.userId ?? null;
}
