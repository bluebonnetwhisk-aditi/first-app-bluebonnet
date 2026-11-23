import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient, ORDER_UPDATE_COLUMNS, requireKds } from '../_lib/kds.js';

const VALID_STATUSES = new Set(['new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireKds(req, res)) return;

  try {
    const db = getAdminClient();

    if (req.method === 'GET') {
      let q = db.from('orders').select('*').neq('status', 'cancelled').order('created_at', { ascending: false });
      const date = typeof req.query.date === 'string' ? req.query.date : '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) q = q.eq('fulfillment_date', date);
      const { data, error } = await q;
      if (error) { console.error('KDS orders DB error:', error); return res.status(500).json({ error: 'Database operation failed' }); }
      return res.status(200).json({ orders: data || [] });
    }

    if (req.method === 'PATCH') {
      const { id, status, updates } = req.body || {};
      if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' });

      // Status transition (handles the [ACCEPTED] marker kept in order_description)
      if (status !== undefined) {
        if (!VALID_STATUSES.has(status)) return res.status(400).json({ error: 'invalid status' });
        const { data: cur } = await db.from('orders').select('order_description').eq('id', id).maybeSingle();
        const curDesc: string = cur?.order_description || '';
        let patch: Record<string, any>;
        if (status === 'accepted') {
          patch = { status: 'new', order_description: curDesc.includes('[ACCEPTED]') ? curDesc : `[ACCEPTED] ${curDesc}` };
        } else {
          const clean = curDesc.replace(/\[ACCEPTED\]\s*/g, '').trim();
          patch = { status, order_description: clean || curDesc };
        }
        const { error } = await db.from('orders').update(patch).eq('id', id);
        if (error) { console.error('KDS orders DB error:', error); return res.status(500).json({ error: 'Database operation failed' }); }
        return res.status(200).json({ success: true });
      }

      // Full detail edit (column whitelist)
      if (updates && typeof updates === 'object') {
        const patch: Record<string, any> = {};
        for (const col of ORDER_UPDATE_COLUMNS) {
          if (updates[col] !== undefined) patch[col] = updates[col];
        }
        if (patch.status === 'accepted') patch.status = 'new';
        if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'no valid columns' });
        const { error } = await db.from('orders').update(patch).eq('id', id);
        if (error) { console.error('KDS orders DB error:', error); return res.status(500).json({ error: 'Database operation failed' }); }
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'status or updates required' });
    }

    if (req.method === 'DELETE') {
      const id = typeof req.query.id === 'string' ? req.query.id : '';
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await db.from('orders').delete().eq('id', id);
      if (error) { console.error('KDS orders DB error:', error); return res.status(500).json({ error: 'Database operation failed' }); }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('KDS orders error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
