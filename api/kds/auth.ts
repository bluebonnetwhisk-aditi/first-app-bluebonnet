import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  clearedSessionCookie,
  createSessionToken,
  getSessionSecret,
  isAuthenticated,
  safeEqual,
  sessionCookie
} from '../_lib/kds.js';

// Naive in-memory throttle (per warm lambda instance) to slow down PIN guessing.
const failures = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 8;

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim() || 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  // GET -> "am I logged in?"
  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: isAuthenticated(req) });
  }

  // DELETE -> logout
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearedSessionCookie());
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const expectedPin = (process.env.KDS_PIN || '').trim();
  const secret = getSessionSecret();
  if (!expectedPin || !secret) {
    console.error('KDS_PIN / KDS_SESSION_SECRET are not configured.');
    return res.status(500).json({ error: 'Server authentication is not configured.' });
  }

  const ip = clientIp(req);
  const rec = failures.get(ip);
  if (rec && Date.now() - rec.first < WINDOW_MS && rec.count >= MAX_FAILS) {
    return res.status(429).json({ success: false, error: 'Too many attempts. Try again later.' });
  }

  try {
    const { pin } = req.body || {};
    if (!pin) {
      return res.status(400).json({ error: 'PIN parameter is required.' });
    }

    if (!safeEqual(String(pin).trim(), expectedPin)) {
      const now = Date.now();
      if (!rec || now - rec.first >= WINDOW_MS) failures.set(ip, { count: 1, first: now });
      else rec.count += 1;
      return res.status(401).json({ success: false, error: 'Incorrect Security PIN.' });
    }

    failures.delete(ip);
    const { token, expires } = createSessionToken(secret);
    res.setHeader('Set-Cookie', sessionCookie(token, expires));
    return res.status(200).json({ success: true, message: 'KDS System Unlocked Successfully.' });
  } catch (err: any) {
    console.error('KDS Auth Exception:', err);
    return res.status(500).json({ error: 'Server authentication error.' });
  }
}
