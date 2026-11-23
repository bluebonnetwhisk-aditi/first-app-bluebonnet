import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared server-only helpers for the Kitchen Display System (KDS) API.
 * Nothing in this file is ever bundled into the browser.
 */

export const SESSION_COOKIE = 'bbw_kds_session';
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://njpufcpzpcjgfsllaedo.supabase.co';

export function getSessionSecret(): string | null {
  const s = process.env.KDS_SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

export function getAdminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server.');
  }
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Creates `<expiryMs>.<hmac>` token */
export function createSessionToken(secret: string): { token: string; expires: number } {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  return { token: `${payload}.${sign(payload, secret)}`, expires };
}

export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function readCookie(req: VercelRequest, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return undefined;
}

export function isAuthenticated(req: VercelRequest): boolean {
  const secret = getSessionSecret();
  if (!secret) return false;
  return verifySessionToken(readCookie(req, SESSION_COOKIE), secret);
}

/**
 * Guard for every /api/kds/* handler. Returns true if the request may proceed;
 * otherwise it has already written the 401 response.
 */
export function requireKds(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function sessionCookie(token: string, expires: number): string {
  return `${SESSION_COOKIE}=${token}; Path=/; Expires=${new Date(expires).toUTCString()}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearedSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict`;
}

/** Only these app_settings keys may ever be written from the KDS UI. */
export const WRITABLE_SETTING_KEYS = new Set(['tiffin_menu_settings', 'gallery_items', 'deleted_gallery_ids']);

/** Columns on public.orders that the KDS may modify. */
export const ORDER_UPDATE_COLUMNS = [
  'customer_name', 'phone_number', 'email', 'is_delivery', 'delivery_address', 'delivery_fee',
  'food_subtotal', 'tax_amount', 'payment_method', 'processing_fee', 'total_amount',
  'order_description', 'fulfillment_date', 'fulfillment_time', 'dietary_notes', 'order_type',
  'status', 'items'
];
