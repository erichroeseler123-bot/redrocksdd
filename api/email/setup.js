import { createHash } from 'node:crypto';

const DOMAIN = 'redrocksdd.com';
const SETUP_TOKEN = 'SBsHpJIMAgso3nn7lGD4ZaiS2HxsTLky5HpUjyKqleY';

function inboundToken(apiKey) {
  return createHash('sha256').update(`${apiKey}:redrocksdd-inbound-v1`).digest('hex');
}

async function callResend(path, init = {}) {
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
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  if (req.query?.token !== SETUP_TOKEN) return res.status(401).json({ ok: false, error: 'unauthorized' });

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

    const listed = await callResend('/domains');
    let domain = Array.isArray(listed?.data)
      ? listed.data.find((item) => String(item?.name || '').toLowerCase() === DOMAIN)
      : null;

    if (!domain) {
      domain = await callResend('/domains', {
        method: 'POST',
        body: JSON.stringify({
          name: DOMAIN,
          capabilities: { sending: 'enabled', receiving: 'enabled' },
        }),
      });
    } else if (domain.capabilities?.receiving !== 'enabled' || domain.capabilities?.sending !== 'enabled') {
      domain = await callResend(`/domains/${domain.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          capabilities: { sending: 'enabled', receiving: 'enabled' },
        }),
      });
    }

    const fullDomain = await callResend(`/domains/${domain.id}`);
    const endpoint = `https://www.redrocksdd.com/api/email/inbound?token=${encodeURIComponent(inboundToken(apiKey))}`;
    const hooks = await callResend('/webhooks');
    const matching = Array.isArray(hooks?.data)
      ? hooks.data.find((item) => item?.endpoint === endpoint && Array.isArray(item?.events) && item.events.includes('email.received'))
      : null;
    let webhook = matching;

    if (!webhook) {
      const existingRedRocksHook = Array.isArray(hooks?.data)
        ? hooks.data.find((item) => String(item?.endpoint || '').includes('redrocksdd.com/api/email/inbound'))
        : null;
      if (existingRedRocksHook) {
        webhook = await callResend(`/webhooks/${existingRedRocksHook.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ endpoint, events: ['email.received'], status: 'enabled' }),
        });
      } else {
        webhook = await callResend('/webhooks', {
          method: 'POST',
          body: JSON.stringify({ endpoint, events: ['email.received'] }),
        });
      }
    }

    return res.status(200).json({
      ok: true,
      domain: fullDomain,
      webhook: { id: webhook?.id || null, status: webhook?.status || 'enabled' },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'setup_failed' });
  }
}
