export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return res.status(500).json({ error: 'No Redis config' });

  try {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    
    const r = await fetch(`${url}/get/inventory:${today}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const json = await r.json();
    console.log('today key:', today, 'result:', json.result ? 'found' : 'not found');
    if (!json.result) return res.status(404).json({ error: 'No data today', key: today });
    return res.status(200).json(JSON.parse(json.result));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
