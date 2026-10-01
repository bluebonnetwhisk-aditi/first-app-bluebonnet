import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Environment Variables
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcHVmY3B6cGNqZ2ZzbGxhZWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjU5MTgsImV4cCI6MjEwNTk0MTkxOH0.dzGN0MmyLxvUHAKkPl2m1lmhh9DX8v81qcFkxdtPEVY';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://njpufcpzpcjgfsllaedo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID;
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET;
const QBO_REFRESH_TOKEN = process.env.QBO_REFRESH_TOKEN;
const QBO_REALM_ID = process.env.QBO_REALM_ID;
const QBO_ENVIRONMENT = process.env.QBO_ENVIRONMENT || 'production';

/**
 * Returns today's YYYY-MM-DD date string in US Central Time
 */
function getCentralTimeTodayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());
}

/**
 * Refreshes QBO OAuth 2.0 Access Token using Refresh Token with auto-rotation persistence
 */
/**
 * Refreshes QBO OAuth 2.0 Access Token using Refresh Token with auto-rotation persistence
 */
async function getQBOAccessToken(
  supabase: any,
  clientId: string,
  clientSecret: string,
  initialRefreshToken: string
): Promise<string> {
  let activeRefreshToken = initialRefreshToken;

  // 1. Check for dynamically rotated refresh token in Supabase DB first
  if (supabase) {
    try {
      const { data: dbSetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'qbo_refresh_token')
        .maybeSingle();

      if (dbSetting?.value?.refresh_token) {
        activeRefreshToken = dbSetting.value.refresh_token;
      }
    } catch (dbErr) {
      console.warn('Supabase QBO token lookup warning:', dbErr);
    }
  }

  if (!clientId || !clientSecret || !activeRefreshToken) {
    throw new Error('QuickBooks Online credentials (QBO_CLIENT_ID, QBO_CLIENT_SECRET, QBO_REFRESH_TOKEN) are missing.');
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', activeRefreshToken);

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: params.toString()
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`QBO token refresh failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('No access_token returned by QBO OAuth.');
  }

  // 2. Automatically persist newly rotated Refresh Token back to Supabase
  if (data.refresh_token && data.refresh_token !== activeRefreshToken && supabase) {
    try {
      await supabase.from('app_settings').upsert(
        {
          key: 'qbo_refresh_token',
          value: {
            refresh_token: data.refresh_token,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
      console.log('✓ Successfully rotated and persisted QBO Refresh Token to Supabase!');
    } catch (persistErr) {
      console.warn('Supabase QBO token auto-rotation save warning:', persistErr);
    }
  }

  return data.access_token;
}

/**
 * Fetches or creates the default "Daily Sales" CustomerRef in QBO
 */
async function getOrCreateDailySalesCustomer(accessToken: string, qboHost: string, realmId: string): Promise<{ value: string; name: string }> {
  try {
    const query = encodeURIComponent("select * from Customer where DisplayName = 'Daily Sales'");
    const queryUrl = `https://${qboHost}/v3/company/${realmId}/query?query=${query}`;

    const res = await fetch(queryUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const customers = data?.QueryResponse?.Customer;
      if (Array.isArray(customers) && customers.length > 0) {
        return { value: customers[0].Id, name: customers[0].DisplayName || 'Daily Sales' };
      }
    }

    // Attempt creation of "Daily Sales" Customer if not found
    const createUrl = `https://${qboHost}/v3/company/${realmId}/customer`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        DisplayName: 'Daily Sales',
        GivenName: 'Daily',
        FamilyName: 'Sales'
      })
    });

    if (createRes.ok) {
      const createData = await createRes.json();
      if (createData?.Customer?.Id) {
        return { value: createData.Customer.Id, name: 'Daily Sales' };
      }
    }
  } catch (err) {
    console.warn('Daily Sales customer lookup warning:', err);
  }

  // Safe default CustomerRef fallback
  return { value: '1', name: 'Daily Sales' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET, POST and OPTIONS for web app & cron calls
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Verify Vercel Cron Security or allow manual execution from KDS UI
  if (CRON_SECRET) {
    const authHeader = req.headers.authorization || req.headers['authorization'];
    const isCron = authHeader === `Bearer ${CRON_SECRET}`;
    const isManualCall = Boolean(
      req.headers['user-agent'] || 
      req.headers['origin'] || 
      req.query?.date || 
      req.body?.date ||
      req.headers['accept']?.includes('application/json')
    );
    if (!isCron && !isManualCall) {
      return res.status(401).json({ error: 'Unauthorized: Invalid CRON_SECRET token' });
    }
  }

  const targetDate = (req.query?.date as string) || (req.body?.date as string) || getCentralTimeTodayStr();
  const todayStr = targetDate;

  try {
    // 2. Initialize Supabase Client
    if (!SUPABASE_KEY) {
      return res.status(500).json({ error: 'Supabase key is not configured.' });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 3. Query eligible orders for target date (US Central Time)
    const { data: rawOrders, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('fulfillment_date', todayStr);

    if (fetchErr) {
      console.error('Supabase fetch error during reconciliation:', fetchErr);
      return res.status(500).json({ error: fetchErr.message });
    }

    // 4. Filter remaining orders: MUST be either 'ready' or 'completed' and not yet reconciled to QBO
    const orders = (rawOrders || []).filter(o => {
      const statusLower = (o.status || '').toLowerCase();
      const isNotCancelled = !o.is_cancelled && statusLower !== 'cancelled';
      const isNotReconciled = !o.reconciled_to_qbo;
      const isReadyOrCompleted = statusLower === 'ready' || statusLower === 'completed' || statusLower === 'complete';
      return isReadyOrCompleted && isNotCancelled && isNotReconciled;
    });

    // 5. Handle Days with Zero Eligible Unreconciled Orders Gracefully
    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No unreconciled ready or completed orders found for ${todayStr} (Central Time).`,
        date: todayStr,
        reconciledCount: 0
      });
    }

    // 6. Resolve QuickBooks API Credentials (check process.env then Supabase app_settings)
    let qboClientId = QBO_CLIENT_ID;
    let qboClientSecret = QBO_CLIENT_SECRET;
    let qboRefreshToken = QBO_REFRESH_TOKEN;
    let qboRealmId = QBO_REALM_ID;
    let qboEnvironment = QBO_ENVIRONMENT;

    if (!qboClientId || !qboClientSecret || !qboRefreshToken || !qboRealmId) {
      try {
        const { data: dbSettings } = await supabase
          .from('app_settings')
          .select('key, value')
          .in('key', ['qbo_config', 'qbo_credentials', 'qbo_refresh_token']);

        if (dbSettings && Array.isArray(dbSettings)) {
          for (const setting of dbSettings) {
            const val = setting?.value || {};
            if (val.client_id || val.QBO_CLIENT_ID) qboClientId = qboClientId || val.client_id || val.QBO_CLIENT_ID;
            if (val.client_secret || val.QBO_CLIENT_SECRET) qboClientSecret = qboClientSecret || val.client_secret || val.QBO_CLIENT_SECRET;
            if (val.refresh_token || val.QBO_REFRESH_TOKEN) qboRefreshToken = qboRefreshToken || val.refresh_token || val.QBO_REFRESH_TOKEN;
            if (val.realm_id || val.QBO_REALM_ID) qboRealmId = qboRealmId || val.realm_id || val.QBO_REALM_ID;
            if (val.environment || val.QBO_ENVIRONMENT) qboEnvironment = qboEnvironment || val.environment || val.QBO_ENVIRONMENT;
          }
        }
      } catch (dbErr) {
        console.warn('Supabase app_settings QBO lookup warning:', dbErr);
      }
    }

    if (!qboClientId || !qboClientSecret || !qboRefreshToken || !qboRealmId) {
      const missingKeys = [
        !qboClientId && 'QBO_CLIENT_ID',
        !qboClientSecret && 'QBO_CLIENT_SECRET',
        !qboRefreshToken && 'QBO_REFRESH_TOKEN',
        !qboRealmId && 'QBO_REALM_ID'
      ].filter(Boolean);

      return res.status(400).json({
        success: false,
        error: `QuickBooks Online API credentials (${missingKeys.join(', ')}) are missing from Vercel environment or Supabase app_settings. Please configure your QuickBooks App keys in Vercel to post Sales Receipts directly to QuickBooks.`,
        date: todayStr,
        eligibleOrdersCount: orders.length,
        missingKeys
      });
    }

    // 7. Consolidate financial metrics and payment method breakdowns
    let totalSales = 0;
    let totalTax = 0;
    let grandTotal = 0;

    let cashTotal = 0;
    let cashCount = 0;
    const cashOrderIds: string[] = [];

    let zelleTotal = 0;
    let zelleCount = 0;

    let cardTotal = 0;
    let cardCount = 0;

    const lineItems: any[] = [];

    for (const order of orders) {
      const foodSubtotal = Math.round((Number(order.food_subtotal) || 0) * 100) / 100;
      const taxAmount = Math.round((Number(order.tax_amount) || 0) * 100) / 100;
      const totalAmount = Math.round((Number(order.total_amount) || 0) * 100) / 100;

      totalSales += foodSubtotal;
      totalTax += taxAmount;
      grandTotal += totalAmount;

      const method = (order.payment_method || 'zelle').toLowerCase();
      const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : 'ORD';

      if (method === 'cash') {
        cashTotal += totalAmount;
        cashCount += 1;
        cashOrderIds.push(`#${shortId}`);
      } else if (method === 'credit_card') {
        cardTotal += totalAmount;
        cardCount += 1;
      } else {
        zelleTotal += totalAmount;
        zelleCount += 1;
      }

      // Individual line item for each order
      lineItems.push({
        Amount: foodSubtotal,
        DetailType: 'SalesItemLineDetail',
        Description: `[Order #${shortId}] Name: ${order.customer_name} | Phone: ${order.phone_number} | Status: ${order.status} | Paid: ${order.payment_method || 'zelle'}`,
        SalesItemLineDetail: {
          UnitPrice: foodSubtotal,
          Qty: 1
        }
      });
    }

    totalSales = Math.round(totalSales * 100) / 100;
    totalTax = Math.round(totalTax * 100) / 100;
    grandTotal = Math.round(grandTotal * 100) / 100;
    cashTotal = Math.round(cashTotal * 100) / 100;
    zelleTotal = Math.round(zelleTotal * 100) / 100;
    cardTotal = Math.round(cardTotal * 100) / 100;

    // Build Audit Memo / PrivateNote for QBO
    const privateNote = [
      `EOD Consolidated Sales Receipt (${todayStr} CT):`,
      `Total Food Sales: $${totalSales.toFixed(2)}`,
      `Total Texas Tax: $${totalTax.toFixed(2)}`,
      `Grand Total: $${grandTotal.toFixed(2)}`,
      `Consolidated Ready/Completed Orders: ${orders.length}`,
      ``,
      `--- PAYMENT METHOD BREAKDOWN ---`,
      `CASH: $${cashTotal.toFixed(2)} across ${cashCount} order(s) [IDs: ${cashOrderIds.length > 0 ? cashOrderIds.join(', ') : 'None'}]`,
      `ZELLE TRANSFERS: $${zelleTotal.toFixed(2)} across ${zelleCount} order(s)`,
      `CREDIT CARDS: $${cardTotal.toFixed(2)} across ${cardCount} order(s)`,
      ``,
      `Reconciled via Bluebonnet Whisk Automated Vercel Cron`
    ].join('\n');

    let qboSalesReceiptId = '';

    // 8. Post Sales Receipt to QuickBooks Online API
    const qboHost = qboEnvironment === 'sandbox'
      ? 'sandbox-quickbooks.api.intuit.com'
      : 'quickbooks.api.intuit.com';

    const accessToken = await getQBOAccessToken(supabase, qboClientId, qboClientSecret, qboRefreshToken);
    const customerRef = await getOrCreateDailySalesCustomer(accessToken, qboHost, qboRealmId);

    const salesReceiptBody = {
      CustomerRef: customerRef,
      TxnDate: todayStr,
      PrivateNote: privateNote,
      Line: lineItems,
      TxnTaxDetail: {
        TotalTax: totalTax
      }
    };

    const qboRes = await fetch(`https://${qboHost}/v3/company/${qboRealmId}/salesreceipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(salesReceiptBody)
    });

    if (!qboRes.ok) {
      const errText = await qboRes.text();
      console.error('QBO Sales Receipt creation error:', errText);
      return res.status(502).json({ error: `QuickBooks Online API Error (${qboRes.status}): ${errText}` });
    }

    const qboData = await qboRes.json();
    if (qboData?.SalesReceipt?.Id) {
      qboSalesReceiptId = qboData.SalesReceipt.Id;
    } else {
      throw new Error('QuickBooks Online did not return a SalesReceipt ID.');
    }

    // 9. Update reconciled orders in Supabase DB
    const reconciledAt = new Date().toISOString();
    const orderIdsToUpdate = orders.map(o => o.id);

    try {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          reconciled_to_qbo: true,
          qbo_doc_id: qboSalesReceiptId,
          reconciled_at: reconciledAt
        })
        .in('id', orderIdsToUpdate);

      if (updateErr) {
        console.warn('Supabase post-reconciliation update warning:', updateErr.message);
      }
    } catch (updateEx: any) {
      console.warn('Supabase post-reconciliation update exception:', updateEx?.message || updateEx);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully posted consolidated Sales Receipt for ${orders.length} ready/completed order(s) to QuickBooks Online! (Receipt #${qboSalesReceiptId})`,
      date: todayStr,
      reconciledCount: orders.length,
      qboSalesReceiptId: qboSalesReceiptId,
      totalSales: totalSales,
      totalTax: totalTax,
      grandTotal: grandTotal,
      cashTotal: cashTotal
    });

  } catch (err: any) {
    console.error('QBO Reconciliation Cron error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
