/**
 * Tiny file-based admin credential store.
 * Phase 1 only — Phase 2 will move this into the real database.
 *
 * File: data/admin.json  (gitignored)
 * Shape: { passwordHash: string, salt: string, updatedAt: string }
 *
 * The env var ADMIN_PASSWORD is kept as a MASTER fallback so the admin can
 * always log in even if they forget the custom password.
 */
import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'admin.json');

type Stored = { passwordHash: string; salt: string; updatedAt: string };

async function read(): Promise<Stored | null> {
  try {
    const buf = await fs.readFile(FILE, 'utf8');
    const json = JSON.parse(buf) as Stored;
    if (json?.passwordHash && json?.salt) return json;
    return null;
  } catch {
    return null;
  }
}

async function write(s: Stored): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(s, null, 2), 'utf8');
}

function hash(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export async function verifyPassword(input: string): Promise<boolean> {
  if (!input) return false;
  // Master fallback — env var always works
  const envPw = process.env.ADMIN_PASSWORD;
  if (envPw && timingSafeEq(input, envPw)) return true;

  const stored = await read();
  if (!stored) return false;
  const computed = hash(input, stored.salt);
  return timingSafeEq(computed, stored.passwordHash);
}

export async function setPassword(newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  await write({
    passwordHash: hash(newPassword, salt),
    salt,
    updatedAt: new Date().toISOString(),
  });
}

export async function clearStoredPassword(): Promise<void> {
  try { await fs.unlink(FILE); } catch { /* file may not exist */ }
}

export async function hasCustomPassword(): Promise<boolean> {
  return (await read()) !== null;
}

export async function getPasswordMeta(): Promise<{ updatedAt: string | null; hasCustom: boolean }> {
  const s = await read();
  return { updatedAt: s?.updatedAt ?? null, hasCustom: !!s };
}

function timingSafeEq(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}
