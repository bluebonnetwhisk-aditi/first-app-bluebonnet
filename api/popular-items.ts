import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient } from './_lib/kds.js';

/**
 * Public, PII-free endpoint: returns only de-duplicated dish identifiers that
 * appeared in past orders (used for the "Popular" badge). No names, phones,
 * emails or amounts are ever returned.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const db = getAdminClient();
    const { data, error } = await db
      .from('orders')
      .select('items')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return res.status(200).json({ ids: [], names: [] });

    const ids = new Set<string>();
    const names = new Set<string>();
    for (const row of data || []) {
      if (!Array.isArray(row.items)) continue;
      for (const it of row.items as any[]) {
        if (it?.menuItemId) ids.add(String(it.menuItemId));
        if (it?.name) names.add(String(it.name));
      }
    }
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ ids: [...ids], names: [...names] });
  } catch {
    return res.status(200).json({ ids: [], names: [] });
  }
}
