export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return res.status(500).json({ error: 'No Redis config' });

  try {
    const today = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
    const r = await fetch(`${url}/get/inventory:${today}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const json = await r.json();
    if (!json.result) return res.status(404).json({ error: 'No data today' });
    return res.status(200).json(JSON.parse(json.result));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
