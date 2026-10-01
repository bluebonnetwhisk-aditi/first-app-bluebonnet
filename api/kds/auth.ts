import type { VercelRequest, VercelResponse } from '@vercel/node';

const KDS_MASTER_PIN = process.env.KDS_PIN || '031686';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { pin } = req.body || {};
    if (!pin) {
      return res.status(400).json({ error: 'PIN parameter is required.' });
    }

    const cleanPin = String(pin).trim();
    if (cleanPin !== KDS_MASTER_PIN) {
      return res.status(401).json({ success: false, error: 'Incorrect Security PIN.' });
    }

    // Set HTTP-Only Secure Session Cookie
    const expiresDate = new Date(Date.now() + 12 * 60 * 60 * 1000).toUTCString(); // 12 hours
    res.setHeader('Set-Cookie', `bbw_kds_session=authenticated; Path=/; Expires=${expiresDate}; HttpOnly; Secure; SameSite=Strict`);

    return res.status(200).json({
      success: true,
      message: 'KDS System Unlocked Successfully.',
      unlockedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('KDS Auth Exception:', err);
    return res.status(500).json({ error: 'Server authentication error.' });
  }
}
