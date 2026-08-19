import { Resend } from 'resend';

const SUPPORT_ADDRESS = 'hello@redrocksdd.com';
const FORWARD_TO = 'erichroeseler123@gmail.com';
const INBOUND_TOKEN = '5BKuMraMvyWJiVcUx-s38FtNRNJdLBJWWBG0lT4VwmI';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, service: 'redrocksdd-inbound', address: SUPPORT_ADDRESS });
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  if (req.query?.token !== INBOUND_TOKEN) return res.status(401).json({ ok: false, error: 'unauthorized' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ ok: false, error: 'resend_not_configured' });

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

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.receiving.forward({
      emailId: event.data.email_id,
      to: FORWARD_TO,
      from: `Red Rocks DD <${SUPPORT_ADDRESS}>`,
    });
    if (error) return res.status(502).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, forwarded: true, id: data?.id || null });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : 'forward_failed' });
  }
}
