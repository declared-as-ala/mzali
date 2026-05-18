import { NextResponse } from 'next/server';
import { sign } from '@/lib/auth';
import { verifyPassword } from '@/lib/admin-storage';

export async function POST(req: Request) {
  const { password } = await req.json();
  const ok = await verifyPassword(String(password ?? ''));
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set('mzali_admin', sign('admin'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('mzali_admin', '', { maxAge: 0, path: '/' });
  return res;
}
