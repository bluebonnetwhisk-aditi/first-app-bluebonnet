import http from 'http';
import https from 'https';
import { URL, URLSearchParams } from 'url';
import { exec } from 'child_process';
import readline from 'readline';

const PORT = 3001;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n=== Bluebonnet & Whisk: QuickBooks Production OAuth Helper ===\n');

  const args = process.argv.slice(2);
  const clientId = (args[0] || process.env.QBO_CLIENT_ID || (await question('Enter Production Client ID: '))).trim();
  const clientSecret = (args[1] || process.env.QBO_CLIENT_SECRET || (await question('Enter Production Client Secret: '))).trim();

  if (!clientId || !clientSecret) {
    console.error('Error: Client ID and Client Secret are required.');
    rl.close();
    process.exit(1);
  }

  // Auto-detect environment if third arg passed or check prefix
  const isSandbox = (args[2] && args[2].toLowerCase() === 'sandbox') || clientId.startsWith('AB') || clientId.startsWith('L0');
  const tokenHost = isSandbox ? 'sandbox-quickbooks.api.intuit.com' : 'oauth.platform.intuit.com';

  const state = 'bbw_' + Math.random().toString(36).substring(2);
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;

  console.log(`\nStarting local OAuth callback listener on http://localhost:${PORT}/callback ...`);
  console.log(`Detected Mode: ${isSandbox ? 'SANDBOX / DEVELOPMENT' : 'PRODUCTION'}`);

  const server = http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
    
    if (reqUrl.pathname === '/callback') {
      const code = reqUrl.searchParams.get('code');
      const realmId = reqUrl.searchParams.get('realmId');

      if (!code || !realmId) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h2>Authorization Failed</h2><p>Missing code or realmId.</p>');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #faf7f2; color: #00346f;">
          <h2 style="color: #2e7d32;">✓ QuickBooks Authorization Successful!</h2>
          <p>You can close this tab and return to your terminal.</p>
        </div>
      `);

      console.log('\n======================================================');
      console.log('✓ AUTHORIZATION SUCCESSFUL!');
      console.log('======================================================');
      console.log(`REALM ID (Company ID): ${realmId}`);

      try {
        const tokenData = await exchangeCodeForTokens(clientId, clientSecret, code, REDIRECT_URI, isSandbox);
        console.log(`REFRESH TOKEN: ${tokenData.refresh_token}`);
        console.log('======================================================\n');
        console.log('Add these lines to your environment variables (.env):\n');
        console.log(`QBO_ENVIRONMENT="${isSandbox ? 'sandbox' : 'production'}"`);
        console.log(`QBO_CLIENT_ID="${clientId}"`);
        console.log(`QBO_CLIENT_SECRET="${clientSecret}"`);
        console.log(`QBO_REALM_ID="${realmId}"`);
        console.log(`QBO_REFRESH_TOKEN="${tokenData.refresh_token}"\n`);
      } catch (err) {
        console.error('Failed to exchange code for tokens:', err.message);
      }

      server.close();
      rl.close();
      process.exit(0);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[Port Error] Port ${PORT} is currently in use by another application on your computer.`);
      console.error(`Please make sure to add "http://localhost:${PORT}/callback" in your Intuit Developer App Redirect URIs section.\n`);
    } else {
      console.error('\nServer error:', err.message);
    }
    rl.close();
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`Opening browser for Intuit login...\nURL: ${authUrl}\n`);
    const startCmd = process.platform === 'win32' ? `start "" "${authUrl}"` : `open "${authUrl}"`;
    exec(startCmd);
  });
}

function exchangeCodeForTokens(clientId, clientSecret, code, redirectUri, isSandbox) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
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
      res.on('content-type', () => {});
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

main();
