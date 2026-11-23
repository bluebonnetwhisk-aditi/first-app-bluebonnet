import type { VercelRequest, VercelResponse } from '@vercel/node';

// Best-effort per-IP rate limit to discourage automated link harvesting.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_HITS = 20;

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim() || 'unknown';
}

/**
 * Server-side redirect to the WhatsApp Community group invite.
 * Keeps the invite link out of GitHub and the client JS bundle — configure
 * WHATSAPP_GROUP_INVITE_URL as a Secret env var in Vercel.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = clientIp(req);
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    return res.status(429).send('Too many requests. Please try again later.');
  }
  recent.push(now);
  hits.set(ip, recent);

  const inviteUrl = (process.env.WHATSAPP_GROUP_INVITE_URL || '').trim();
  if (!inviteUrl || !inviteUrl.startsWith('https://chat.whatsapp.com/')) {
    return res.status(503).send('WhatsApp group invite is temporarily unavailable.');
  }

  res.setHeader('Location', inviteUrl);
  return res.status(302).end();
}
