import type { CateringOrder } from '../types/catering';

// Official Desi Dabba Catering Contact: +19455274566
export const DESI_DABBA_PHONE_RAW = '19455274566';
export const DESI_DABBA_PHONE_DISPLAY = '+1 (945) 527-4566';

export function getPaymentMethodLabel(method?: string): string {
  switch (method) {
    case 'cash':
      return 'Cash (Upon Fulfillment)';
    case 'credit_card':
      return 'Credit Card (+3.5% Processing Fee)';
    case 'zelle':
    default:
      return 'Zelle Transfer (945-527-4566)';
  }
}

/**
 * Builds formatted text for a catering order or formal estimate.
 * Uses WhatsApp best practices: concise mobile scanning, no separate tax line item,
 * and a clear all-inclusive Total Amount with payment instructions.
 */
export function buildOrderNotificationText(order: CateringOrder): string {
  const isDelivery = order.is_delivery;
  const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : '';
  const itemsText = order.items && order.items.length > 0
    ? order.items
        .map(i => {
          const sizeStr = i.selectionLabel ? ` (${i.selectionLabel})` : '';
          const notesStr = i.notes ? ` [${i.notes}]` : '';
          return `• *${i.quantity}x ${i.name}*${sizeStr}${notesStr} — $${i.totalPrice.toFixed(2)}`;
        })
        .join('\n')
    : (order.order_description || 'Catering items');

  const discountAmount = order.discount_amount || 0;
  const deliveryFee = order.delivery_fee || 0;
  const processingFee = order.processing_fee || 0;
  const grandTotal = order.total_amount || 0;

  const lines = [
    `*🍱 NEW ORDER • DESI DABBA | BLUEBONNET WHISK*`,
    `*Ref:* #${shortId} (${order.order_type === 'estimate' ? 'Estimate Request' : 'Confirmed Order Request'})`,
    ``,
    `👤 *Customer:* ${order.customer_name}`,
    `📞 *Phone:* ${order.phone_number}`,
    order.email ? `✉️ *Email:* ${order.email}` : null,
    ``,
    `📅 *Date:* ${order.fulfillment_date}`,
    `⏰ *Window:* ${order.fulfillment_time} (CT)`,
    isDelivery
      ? `🚚 *Delivery:* ${order.delivery_address || 'Address on file'}`
      : `🏪 *Pickup:* 2437 Deerwood Dr, Little Elm, TX`,
    order.dietary_notes ? `🌿 *Dietary / Notes:* ${order.dietary_notes}` : null,
    ``,
    `*🛍️ ORDERED ITEMS:*`,
    itemsText,
    ``,
    discountAmount > 0
      ? `*Discount Applied:* -$${discountAmount.toFixed(2)}${order.discount_reason ? ` (${order.discount_reason})` : ''}`
      : null,
    isDelivery && deliveryFee > 0 ? `*Delivery Fee:* $${deliveryFee.toFixed(2)}` : null,
    processingFee > 0 ? `*Card Processing Fee (3.5%):* $${processingFee.toFixed(2)}` : null,
    `💰 *Total Amount:* *$${grandTotal.toFixed(2)}*`,
    `💳 *Payment:* ${getPaymentMethodLabel(order.payment_method)}`,
    ``,
    `_Sent via Bluebonnet Whisk Online Order Portal (bluebonnetwhisk.com)_`
  ];

  return lines.filter(l => l !== null).join('\n');
}

/**
 * Builds a formatted WhatsApp link for a catering order or formal estimate.
 */
export function buildOrderWhatsAppUrl(order: CateringOrder): string {
  const message = buildOrderNotificationText(order);
  return `https://wa.me/${DESI_DABBA_PHONE_RAW}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a formatted SMS link (for mobile/desktop SMS client)
 */
export function buildOrderSMSUrl(order: CateringOrder): string {
  const message = buildOrderNotificationText(order);
  // SMS link format: sms:+19452162199?body=...
  return `sms:+${DESI_DABBA_PHONE_RAW}?body=${encodeURIComponent(message)}`;
}

/**
 * Builds a formatted WhatsApp link for a general inquiry or cake quote.
 */
export function buildInquiryWhatsAppUrl(inquiry: {
  name: string;
  phone: string;
  email: string;
  date?: string;
  occasion?: string;
  category?: string;
  flavor?: string;
  size?: string;
  dietary?: string;
  customWishes?: string;
  estimatedTotal?: string;
}): string {
  const lines = [
    `*✨ New Custom Inquiry on Bluebonnet Whisk!*`,
    ``,
    `*Customer:* ${inquiry.name}`,
    `*Phone:* ${inquiry.phone}`,
    `*Email:* ${inquiry.email || 'Not Provided'}`,
    inquiry.date ? `*Target Date:* ${inquiry.date}` : null,
    inquiry.occasion ? `*Occasion:* ${inquiry.occasion}` : null,
    inquiry.category ? `*Service Category:* ${inquiry.category}` : null,
    inquiry.flavor ? `*Flavor:* ${inquiry.flavor}` : null,
    inquiry.size ? `*Portion Size:* ${inquiry.size}` : null,
    inquiry.dietary ? `*Dietary:* ${inquiry.dietary}` : null,
    inquiry.estimatedTotal ? `*Estimated Total:* ${inquiry.estimatedTotal}` : null,
    inquiry.customWishes ? `*Custom Notes:* ${inquiry.customWishes}` : null,
    ``,
    `_Sent via Bluebonnet Whisk Inquiry Wizard (bluebonnetwhisk.com)_`
  ];

  const message = lines.filter(l => l !== null).join('\n');
  return `https://wa.me/${DESI_DABBA_PHONE_RAW}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a formatted SMS link for custom inquiries
 */
export function buildInquirySMSUrl(inquiry: {
  name: string;
  phone: string;
  email: string;
  date?: string;
  occasion?: string;
  category?: string;
  flavor?: string;
  size?: string;
  dietary?: string;
  customWishes?: string;
  estimatedTotal?: string;
}): string {
  const lines = [
    `*New Inquiry on Bluebonnet Whisk*`,
    `Customer: ${inquiry.name} (${inquiry.phone})`,
    `Email: ${inquiry.email || 'Not Provided'}`,
    inquiry.date ? `Date: ${inquiry.date}` : null,
    inquiry.occasion ? `Occasion: ${inquiry.occasion}` : null,
    inquiry.flavor ? `Flavor: ${inquiry.flavor}` : null,
    inquiry.estimatedTotal ? `Estimate: ${inquiry.estimatedTotal}` : null,
    inquiry.customWishes ? `Notes: ${inquiry.customWishes}` : null
  ];

  const message = lines.filter(l => l !== null).join('\n');
  return `sms:+${DESI_DABBA_PHONE_RAW}?body=${encodeURIComponent(message)}`;
}
