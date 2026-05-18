import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { verifyPassword, setPassword, clearStoredPassword, getPasswordMeta } from '@/lib/admin-storage';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const meta = await getPasswordMeta();
  return NextResponse.json({
    username: 'admin',
    hasCustomPassword: meta.hasCustom,
    passwordUpdatedAt: meta.updatedAt,
    envFallbackEnabled: Boolean(process.env.ADMIN_PASSWORD),
  });
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const { currentPassword, newPassword, confirmPassword } = await req.json();
    if (!newPassword || newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Les mots de passe ne correspondent pas.' }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: 'Au moins 6 caractères.' }, { status: 400 });
    }
    const ok = await verifyPassword(String(currentPassword ?? ''));
    if (!ok) return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
    await setPassword(String(newPassword));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}

export async function DELETE() {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await clearStoredPassword();
  return NextResponse.json({ ok: true });
}
