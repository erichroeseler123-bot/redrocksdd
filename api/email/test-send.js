import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ ok: false, error: 'resend_not_configured' });

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: 'Red Rocks DD <hello@redrocksdd.com>',
      to: ['erichroeseler123@gmail.com'],
      subject: 'Red Rocks DD email test',
      text: 'This is a live delivery test from hello@redrocksdd.com. If you received this in Gmail, outgoing Red Rocks DD email is working.'
    });
    if (error) return res.status(502).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, id: data?.id || null });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'send_failed' });
  }
}
