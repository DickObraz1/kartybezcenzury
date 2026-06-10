export const prerender = false;

import type { APIRoute } from 'astro';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Neplatný požadavek.' }, 400);
  }

  const { email, gdpr, honeypot } = body as {
    email?: string;
    gdpr?: boolean;
    honeypot?: string;
  };

  // Honeypot — bot vyplnil skryté pole
  if (honeypot) {
    return json({ ok: true }, 200);
  }

  // Validace
  if (!email || !EMAIL_RE.test(String(email))) {
    return json({ ok: false, error: 'Zadej platný email.' }, 400);
  }
  if (!gdpr) {
    return json({ ok: false, error: 'Souhlas je povinný.' }, 400);
  }

  const apiKey = import.meta.env.ECOMAIL_API_KEY;
  const listId = import.meta.env.ECOMAIL_LIST_ID ?? '4';

  if (!apiKey) {
    console.error('[subscribe] ECOMAIL_API_KEY není nastaveno');
    return json({ ok: false, error: 'Chyba serveru. Zkus to později.' }, 500);
  }

  try {
    const res = await fetch(`https://api2.ecomailapp.cz/lists/${listId}/subscribe`, {
      method: 'POST',
      headers: {
        'key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriber_data: { email: String(email).trim().toLowerCase() },
        trigger_autoresponders: true,
        update_existing: true,
        resubscribe: false,
      }),
    });

    if (!res.ok) {
      // Logjeme status server-side, klientovi neprozrazujeme detaily
      console.error('[subscribe] Ecomail error:', res.status, await res.text());
      return json({ ok: false, error: 'Něco se posralo. Zkus to znovu.' }, 502);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[subscribe] Fetch failed:', err);
    return json({ ok: false, error: 'Chyba sítě. Zkus to za chvíli.' }, 503);
  }
};

export const GET: APIRoute = () => json({ ok: false, error: 'Method Not Allowed' }, 405);

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
