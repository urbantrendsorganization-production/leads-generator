// WhatsApp Business Cloud API integration
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages
// Requires WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID env vars

const WA_GRAPH_VERSION = 'v20.0';
const WA_BASE_URL = `https://graph.facebook.com/${WA_GRAPH_VERSION}`;

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function getConfig(): { token: string; phoneNumberId: string } | null {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId || token === 'your_whatsapp_api_token_here') return null;
  return { token, phoneNumberId };
}

export function isWhatsAppConfigured(): boolean {
  return getConfig() !== null;
}

/** Strip all non-digit characters except leading + */
function normalizePhone(phone: string): string {
  const stripped = phone.replace(/[^\d+]/g, '');
  return stripped.startsWith('+') ? stripped.slice(1) : stripped;
}

/**
 * Send a free-text message to a WhatsApp number.
 * Note: WhatsApp Cloud API only allows free-text to numbers that have messaged
 * the business within the past 24 hours. For cold outreach, use sendTemplate().
 */
export async function sendWhatsAppText(
  to: string,
  body: string
): Promise<WhatsAppSendResult> {
  const config = getConfig();
  if (!config) {
    return {
      success: false,
      error:
        'WhatsApp Cloud API not configured. Set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in the backend .env.',
    };
  }

  const recipient = normalizePhone(to);

  try {
    const response = await fetch(`${WA_BASE_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: { preview_url: false, body },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await response.json()) as any;
    if (!response.ok) {
      return { success: false, error: data?.error?.message ?? `HTTP ${response.status}` };
    }
    return { success: true, messageId: data?.messages?.[0]?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Send a pre-approved WhatsApp message template.
 * Templates must be created and approved in the Meta Business Manager first.
 * Use this for cold outreach since it doesn't require a prior 24h conversation window.
 *
 * Example templates you can create:
 *   - "business_intro" — "Hi {{1}}, I found your company {{2}} and wanted to reach out..."
 *   - "hello_world"    — Meta's built-in test template
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode = 'en_US',
  components?: {
    type: 'body' | 'header' | 'button';
    parameters: { type: 'text'; text: string }[];
  }[]
): Promise<WhatsAppSendResult> {
  const config = getConfig();
  if (!config) {
    return { success: false, error: 'WhatsApp Cloud API not configured.' };
  }

  const recipient = normalizePhone(to);

  const payload: any = {
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };
  if (components && components.length > 0) {
    payload.template.components = components;
  }

  try {
    const response = await fetch(`${WA_BASE_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await response.json()) as any;
    if (!response.ok) {
      return { success: false, error: data?.error?.message ?? `HTTP ${response.status}` };
    }
    return { success: true, messageId: data?.messages?.[0]?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
