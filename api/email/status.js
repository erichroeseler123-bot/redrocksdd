const DOMAIN_ID = '39e04968-01a4-4a2e-b555-8d385aa9408b';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ ok: false, error: 'resend_not_configured' });
  try {
    const response = await fetch(`https://api.resend.com/domains/${DOMAIN_ID}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store'
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return res.status(response.status).json({ ok: false, error: data?.message || data?.error || 'resend_error' });
    return res.status(200).json({ ok: true, status: data?.status, capabilities: data?.capabilities, records: data?.records });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'status_failed' });
  }
}
