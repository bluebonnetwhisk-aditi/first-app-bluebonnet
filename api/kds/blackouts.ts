import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient, requireKds } from '../_lib/kds.js';

const RULE_TYPES = new Set(['single', 'recurring_weekday', 'recurring_month']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireKds(req, res)) return;

  try {
    const db = getAdminClient();

    if (req.method === 'POST') {
      const r = req.body || {};
      const rule_type = RULE_TYPES.has(r.rule_type) ? r.rule_type : 'single';
      const { data, error } = await db
        .from('calendar_blackouts')
        .insert([{
          closed_date: typeof r.closed_date === 'string' ? r.closed_date : null,
          day_of_week: Number.isInteger(r.day_of_week) ? r.day_of_week : null,
          month_of_year: Number.isInteger(r.month_of_year) ? r.month_of_year : null,
          rule_type,
          reason: typeof r.reason === 'string' ? r.reason.slice(0, 300) : null
        }])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ rule: data });
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: 'id required' });
      const { error } = await db.from('calendar_blackouts').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('KDS blackouts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
