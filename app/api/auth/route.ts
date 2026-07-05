import { NextResponse } from 'next/server';
import { COOKIE, LEGACY_COOKIE, signSession } from '@/lib/auth';
import { verifyPassword as verifyAdminPassword } from '@/lib/admin-storage';
import { employeeService } from '@/services';

/**
 * Login.
 * - If `username` is omitted or equals 'admin' (case-insensitive), this is an admin login
 *   verified against ADMIN_PASSWORD env / data/admin.json hash (legacy admin-only path).
 * - Otherwise treat `username` as an employee email and verify against the employee store.
 */
export async function POST(req: Request) {
  let body: { username?: string; email?: string; password?: string } = {};
  try { body = await req.json(); } catch { /* keep empty */ }
  const password = String(body.password ?? '');
  const usernameRaw = String(body.username ?? body.email ?? '').trim();
  const isAdminLogin = !usernameRaw || usernameRaw.toLowerCase() === 'admin';

  if (isAdminLogin) {
    const ok = await verifyAdminPassword(password);
    if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
    const cookieValue = signSession({ role: 'admin', userId: 'admin', name: 'Admin' });
    const res = NextResponse.json({ ok: true, role: 'admin', redirect: '/admin' });
    res.cookies.set(COOKIE, cookieValue, {
      httpOnly: true, sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7,
    });
    // Keep legacy cookie around for back-compat with old tabs (will be ignored once expired).
    res.cookies.set(LEGACY_COOKIE, '', { maxAge: 0, path: '/' });
    return res;
  }

  // Employee login
  const employee = await employeeService.verifyCredentials(usernameRaw, password);
  if (!employee) return NextResponse.json({ ok: false }, { status: 401 });

  const cookieValue = signSession({ role: 'employee', userId: employee.id, name: employee.name });
  const res = NextResponse.json({ ok: true, role: 'employee', redirect: '/employee' });
  res.cookies.set(COOKIE, cookieValue, {
    httpOnly: true, sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set(LEGACY_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { maxAge: 0, path: '/' });
  res.cookies.set(LEGACY_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
