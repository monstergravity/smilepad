import fs from 'node:fs';
import https from 'node:https';

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [
          line.slice(0, index).trim(),
          line
            .slice(index + 1)
            .trim()
            .replace(/^['"]|['"]$/g, ''),
        ];
      }),
  );
}

const env = {
  ...loadEnvFile('.env.example'),
  ...loadEnvFile('.env.local'),
  ...process.env,
};

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL and SUPABASE_SECRET_KEY for server-side export.');
  process.exit(1);
}

function request(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);
    const req = https.request(
      url,
      {
        method: 'GET',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let text = '';
        res.on('data', (chunk) => {
          text += chunk;
        });
        res.on('end', () => {
          let body = text;
          try {
            body = JSON.parse(text);
          } catch {
            // Keep raw text for non-JSON errors.
          }
          resolve({ body, status: res.statusCode });
        });
      },
    );

    req.on('error', reject);
    req.end();
  });
}

const response = await request('/rest/v1/waitlist_signups?select=email,created_at&order=created_at.desc');

if (response.status < 200 || response.status >= 300) {
  console.error(JSON.stringify(response.body, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(response.body, null, 2));
