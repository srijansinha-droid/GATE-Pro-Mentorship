export default async function handler(req, res) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const GAS_URL = process.env.GAS_URL;
  const GAS_API_KEY = process.env.GAS_API_KEY;
  if (!GAS_URL || !GAS_API_KEY) {
    return res.status(500).json({ success: false, message: 'Server misconfigured.' });
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    // API key ko URL param ke through bhej rahe hain taaki 100% pakka lage
    const targetUrl = `${GAS_URL}?apiKey=${encodeURIComponent(GAS_API_KEY)}`;
    
    const gasResp = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body
    });
    const text = await gasResp.text();
    res.status(200).setHeader('Content-Type', 'application/json').send(text);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upstream error.' });
  }
}
