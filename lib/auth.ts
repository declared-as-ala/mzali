/**
 * Simple cookie-based admin gate.
 * Set ADMIN_PASSWORD + SESSION_SECRET in .env. POST to /api/auth to log in.
 */
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET ?? 'change-me';

export function sign(value: string) {
  const sig = crypto.createHmac('sha256', SECRET).update(value).digest('hex');
  return `${value}.${sig}`;
}
export function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const i = signed.lastIndexOf('.');
  if (i < 0) return null;
  const value = signed.slice(0, i);
  const sig = signed.slice(i + 1);
  const expected = crypto.createHmac('sha256', SECRET).update(value).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? value : null;
}
export function isAdmin() {
  const c = cookies().get('mzali_admin')?.value;
  return verify(c) === 'admin';
}
