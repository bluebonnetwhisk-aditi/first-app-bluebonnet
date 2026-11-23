import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient, requireKds, WRITABLE_SETTING_KEYS } from '../_lib/kds.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireKds(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { key, value } = req.body || {};
    if (typeof key !== 'string' || !WRITABLE_SETTING_KEYS.has(key)) {
      return res.status(400).json({ error: 'Setting key not allowed' });
    }
    const db = getAdminClient();
    const { error } = await db
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) { console.error('KDS settings DB error:', error); return res.status(500).json({ error: 'Database operation failed' }); }
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('KDS settings error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
