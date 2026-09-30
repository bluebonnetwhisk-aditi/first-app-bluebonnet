import https from 'https';
import { URLSearchParams } from 'url';

const environment = process.env.QBO_ENVIRONMENT || 'production';
const clientId = process.env.QBO_CLIENT_ID;
const clientSecret = process.env.QBO_CLIENT_SECRET;
const realmId = process.env.QBO_REALM_ID;
const refreshToken = process.env.QBO_REFRESH_TOKEN;

console.log('\n=== Bluebonnet & Whisk: QuickBooks Online Production Connection Test ===\n');

if (!clientId || !clientSecret || !realmId || !refreshToken) {
  console.error('Error: Missing required QBO environment variables in .env');
  process.exit(1);
}

console.log(`Environment: ${environment}`);
console.log(`Company Realm ID: ${realmId}`);
console.log(`Client ID: ${clientId.substring(0, 8)}...`);

async function testConnection() {
  try {
    console.log('\n1. Refreshing Access Token with Intuit OAuth 2.0 Server...');
    const tokenData = await refreshAccessToken(clientId, clientSecret, refreshToken);
    console.log('✓ Access Token refreshed successfully!');
    console.log(`   Access Token Expires In: ${tokenData.expires_in} seconds`);

    console.log('\n2. Fetching Company Info from QuickBooks Online Accounting API...');
    const companyInfo = await fetchCompanyInfo(realmId, tokenData.access_token, environment);
    console.log('======================================================');
    console.log('✓ QUICKBOOKS ONLINE PRODUCTION CONNECTION VERIFIED!');
    console.log('======================================================');
    console.log(`Company Legal Name: ${companyInfo.CompanyName || 'N/A'}`);
    console.log(`Country / Location: ${companyInfo.Country || 'US'}`);
    console.log(`Company Addr: ${companyInfo.CompanyAddr?.Line1 || 'N/A'}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ QBO Connection Test Failed:', err.message);
  }
}

function refreshAccessToken(clientId, clientSecret, refreshToken) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }).toString();

    const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const options = {
      hostname: 'oauth.platform.intuit.com',
      path: '/oauth2/v1/tokens/bearer',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(json.error_description || json.error || data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function fetchCompanyInfo(realmId, accessToken, environment) {
  return new Promise((resolve, reject) => {
    const host = environment === 'sandbox' 
      ? 'sandbox-quickbooks.api.intuit.com' 
      : 'quickbooks.api.intuit.com';

    const options = {
      hostname: host,
      path: `/v3/company/${realmId}/companyinfo/${realmId}?minorversion=73`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300 && json.CompanyInfo) {
            resolve(json.CompanyInfo);
          } else {
            reject(new Error(data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

testConnection();
