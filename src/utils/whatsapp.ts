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
 */
export function buildOrderNotificationText(order: CateringOrder): string {
  const isDelivery = order.is_delivery;
  const itemsText = order.items
    .map(i => `• ${i.name}${i.notes ? ` [${i.notes}]` : ''} (${i.selectionLabel}) × ${i.quantity} = $${i.totalPrice.toFixed(2)}`)
    .join('\n');

  const lines = [
    `*🎉 New Desi Dabba Catering Submission!*`,
    ``,
    `*Reference #:* #${order.id.slice(0, 8).toUpperCase()}`,
    `*Submission Type:* ${order.order_type === 'estimate' ? 'SAVED ESTIMATE' : 'OFFICIAL CATERING ORDER'}`,
    `*Customer Name:* ${order.customer_name}`,
    `*Phone:* ${order.phone_number}`,
    `*Email:* ${order.email}`,
    `*Payment Method:* ${getPaymentMethodLabel(order.payment_method)}`,
    ``,
    `*Fulfillment:* ${isDelivery ? 'Venue Delivery (+$50 Flat Fee)' : 'Client Self-Pickup (Frisco Workshop)'}`,
    isDelivery && order.delivery_address ? `*Delivery Destination:* ${order.delivery_address}` : null,
    `*Fulfillment Date:* ${order.fulfillment_date}`,
    `*Target Window:* ${order.fulfillment_time} (US Central Time)`,
    order.dietary_notes ? `*Dietary / Satvik Notes:* ${order.dietary_notes}` : null,
    ``,
    `*Itemized Trays & Dishes:*`,
    itemsText,
    ``,
    `*Food Subtotal:* $${order.food_subtotal.toFixed(2)}`,
    `*Delivery Fee:* $${order.delivery_fee.toFixed(2)}`,
    `*Texas Tax (8.25%):* $${order.tax_amount.toFixed(2)}`,
    (order.processing_fee && order.processing_fee > 0) 
      ? `*Card Processing Fee (3.5%):* $${order.processing_fee.toFixed(2)}` 
      : null,
    `*Grand Total:* $${order.total_amount.toFixed(2)}`,
    ``,
    `_Sent via Bluebonnet Whisk Online Catering Portal (bluebonnetwhisk.com)_`
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
    `*Email:* ${inquiry.email}`,
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
    `Email: ${inquiry.email}`,
    inquiry.date ? `Date: ${inquiry.date}` : null,
    inquiry.occasion ? `Occasion: ${inquiry.occasion}` : null,
    inquiry.flavor ? `Flavor: ${inquiry.flavor}` : null,
    inquiry.estimatedTotal ? `Estimate: ${inquiry.estimatedTotal}` : null,
    inquiry.customWishes ? `Notes: ${inquiry.customWishes}` : null
  ];

  const message = lines.filter(l => l !== null).join('\n');
  return `sms:+${DESI_DABBA_PHONE_RAW}?body=${encodeURIComponent(message)}`;
}
