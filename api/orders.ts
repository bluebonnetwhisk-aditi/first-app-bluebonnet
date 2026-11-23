import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { getAdminClient } from './_lib/kds.js';

// Per-IP rate limit: max 15 order submissions per 15 minutes (allows split-date multi-orders).
const submissions = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS = 15;

const ALLOWED_PAYMENT_METHODS = new Set(['zelle', 'cash', 'card', 'venmo', 'online']);
const ALLOWED_ORDER_TYPES = new Set(['order', 'estimate', 'tiffin', 'catering', 'cake']);

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim() || 'unknown';
}

function isFiniteNonNeg(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

function cleanStr(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate limit per IP
  const ip = clientIp(req);
  const now = Date.now();
  const recent = (submissions.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_SUBMISSIONS) {
    return res.status(429).json({ error: 'Too many order submissions. Please wait a few minutes or contact us on WhatsApp.' });
  }

  const body = req.body || {};

  // Validate required customer fields
  const customer_name = cleanStr(body.customer_name, 200);
  const phone_number = cleanStr(body.phone_number, 40);
  const email = cleanStr(body.email, 150);
  if (!customer_name || !phone_number) {
    return res.status(400).json({ error: 'Customer name and phone number are required.' });
  }

  // Validate items array
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
    return res.status(400).json({ error: 'Order must contain between 1 and 100 items.' });
  }
  let itemsSum = 0;
  for (const item of body.items) {
    if (
      !item || typeof item !== 'object' ||
      typeof item.name !== 'string' || !item.name.trim() ||
      typeof item.quantity !== 'number' || !Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 500 ||
      !isFiniteNonNeg(item.totalPrice) || item.totalPrice > 50000
    ) {
      return res.status(400).json({ error: 'Invalid item in order.' });
    }
    itemsSum += item.totalPrice;
  }

  // Validate financial totals (prevents negative or mismatched client totals)
  const food_subtotal = Number(body.food_subtotal);
  const tax_amount = Number(body.tax_amount ?? 0);
  const delivery_fee = Number(body.delivery_fee ?? 0);
  const processing_fee = Number(body.processing_fee ?? 0);
  const total_amount = Number(body.total_amount);

  if (
    !isFiniteNonNeg(food_subtotal) ||
    !isFiniteNonNeg(tax_amount) ||
    !isFiniteNonNeg(delivery_fee) ||
    !isFiniteNonNeg(processing_fee) ||
    !isFiniteNonNeg(total_amount) ||
    total_amount <= 0 ||
    total_amount > 50000
  ) {
    return res.status(400).json({ error: 'Invalid order totals.' });
  }

  // Ensure items sum and grand total are consistent (allow small rounding tolerance)
  const expectedTotal = food_subtotal + tax_amount + delivery_fee + processing_fee;
  if (Math.abs(expectedTotal - total_amount) > 0.25 || (itemsSum > 0 && Math.abs(itemsSum - food_subtotal) > Math.max(1, itemsSum * 0.25))) {
    return res.status(400).json({ error: 'Order totals do not match item prices.' });
  }

  const fulfillment_date = cleanStr(body.fulfillment_date, 20);
  const fulfillment_time = cleanStr(body.fulfillment_time, 50);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fulfillment_date)) {
    return res.status(400).json({ error: 'Valid fulfillment date (YYYY-MM-DD) is required.' });
  }

  const payment_method = ALLOWED_PAYMENT_METHODS.has(body.payment_method) ? body.payment_method : 'zelle';
  const order_type = ALLOWED_ORDER_TYPES.has(body.order_type) ? body.order_type : 'order';
  const is_delivery = Boolean(body.is_delivery);
  const delivery_address = is_delivery ? cleanStr(body.delivery_address, 300) || null : null;
  const dietary_notes = cleanStr(body.dietary_notes, 1000) || null;
  const order_description =
    cleanStr(body.order_description, 4000) ||
    body.items
      .map((i: any) => `${String(i.name).slice(0, 100)} (${String(i.selectionLabel || '').slice(0, 60)} × ${i.quantity}) [${Number(i.totalPrice).toFixed(2)}]`)
      .join('; ')
      .slice(0, 4000);

  const id = randomUUID();
  const created_at = new Date().toISOString();

  const record = {
    id,
    customer_name,
    phone_number,
    email,
    is_delivery,
    delivery_address,
    delivery_fee,
    food_subtotal,
    tax_amount,
    payment_method,
    processing_fee,
    total_amount,
    order_description,
    fulfillment_date,
    fulfillment_time,
    dietary_notes,
    order_type,
    status: 'new', // Always enforced server-side
    items: body.items
  };

  try {
    const db = getAdminClient();
    const { error } = await db.from('orders').insert([record]);
    if (error) {
      console.error('Order insert failed:', error);
      return res.status(500).json({ error: 'Could not save order. Please try again.' });
    }

    recent.push(now);
    submissions.set(ip, recent);

    return res.status(200).json({ order: { ...record, created_at } });
  } catch (err) {
    console.error('POST /api/orders exception:', err);
    return res.status(500).json({ error: 'Server error while placing order.' });
  }
}
