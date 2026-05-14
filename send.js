export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { webhookUrl, message, csvData } = req.body;
  if (!webhookUrl || !message) return res.status(400).json({ error: 'Missing required fields' });

  const slackRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
  const slackText = await slackRes.text();
  if (!slackRes.ok) return res.status(500).json({ error: `Slack error: ${slackText}` });

  if (csvData && process.env.KV_REST_API_URL) {
    try {
      const url = process.env.KV_REST_API_URL;
      const token = process.env.KV_REST_API_TOKEN;
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      await fetch(`${url}/set/inventory:${today}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(csvData) }),
      });
      await fetch(`${url}/expire/inventory:${today}/86400`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (e) {
      console.error('Redis error:', e);
    }
  }

  return res.status(200).json({ ok: true });
}
