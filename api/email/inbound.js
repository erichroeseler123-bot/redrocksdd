const SUPPORT_ADDRESS = 'hello@redrocksdd.com';
const FORWARD_TO = 'erichroeseler123@gmail.com';

async function resend(path, init = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  const response = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || `Resend request failed (${response.status})`);
  return data;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, service: 'redrocksdd-inbound', address: SUPPORT_ADDRESS });
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!event || event.type !== 'email.received' || !event.data?.email_id) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const recipients = Array.isArray(event.data.to)
      ? event.data.to.map((value) => String(value).toLowerCase())
      : [];
    if (recipients.length && !recipients.includes(SUPPORT_ADDRESS)) {
      return res.status(200).json({ ok: true, ignored: true, reason: 'not_redrocksdd_support' });
    }

    const result = await resend(`/emails/receiving/${encodeURIComponent(event.data.email_id)}/forward`, {
      method: 'POST',
      body: JSON.stringify({
        to: [FORWARD_TO],
        from: `Red Rocks DD <${SUPPORT_ADDRESS}>`,
      }),
    });
    return res.status(200).json({ ok: true, forwarded: true, id: result?.id || null });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : 'forward_failed' });
  }
}
