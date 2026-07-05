import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { employeeService } from '@/services';

/**
 * Minimal employee directory (id → name) usable by any authenticated user.
 * Returned data has no sensitive fields — names only, for UI labels.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const employees = await employeeService.list();
  return NextResponse.json(employees.map((e) => ({ id: e.id, name: e.name, active: e.active })));
}
