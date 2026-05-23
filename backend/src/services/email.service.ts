import { Resend } from 'resend';
import { prisma } from '../utils/prisma';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export function isResendConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function renderTemplate(template: string, vars: { firstName: string; company: string }): string {
  return template
    .replace(/\{first_name\}/gi, vars.firstName)
    .replace(/\{company\}/gi, vars.company);
}

const TRACKING_PIXEL = (sendId: string): string => {
  const base = process.env.BACKEND_URL || 'http://localhost:3001';
  return `<img src="${base}/api/email/track/open/${sendId}.gif" width="1" height="1" style="display:none;max-height:0;overflow:hidden;border:0;margin:0;padding:0;" alt="">`;
};

function buildHtml(opts: {
  senderName: string;
  bodyHtml: string;
  sendId: string;
}): string {
  const year = new Date().getFullYear();
  const support = process.env.EMAIL_SUPPORT || 'support@trendyyleads.com';
  const bodyRows = opts.bodyHtml
    .split('\n')
    .map(line => line.trim() === '' ? '<br>' : `<p style="margin:0 0 14px 0;">${line}</p>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Message from ${opts.senderName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="background:#0D9488;padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">TrendyyLeads</span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px;color:rgba(255,255,255,0.75);">Outreach Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <div style="font-size:15px;line-height:1.75;color:#1a1a1a;">
                ${bodyRows}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                      This message was sent via <strong style="color:#6b7280;">TrendyyLeads</strong>, a B2B outreach platform.<br>
                      If this email was unexpected, please contact us at
                      <a href="mailto:${support}" style="color:#0D9488;text-decoration:none;">${support}</a>.
                    </p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#d1d5db;">© ${year} TrendyyLeads</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  ${TRACKING_PIXEL(opts.sendId)}
</body>
</html>`;
}

export async function sendColdEmail(
  userId: string,
  payload: { toEmail: string; toName: string; company: string; subject: string; body: string }
): Promise<{ success: boolean; sendId?: string; error?: string }> {
  // Fetch sender info for From name + Reply-To
  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const senderName = sender?.name?.trim() || 'TrendyyLeads User';
  const fromAddress = process.env.EMAIL_FROM!;
  const fromHeader = `${senderName} via TrendyyLeads <${fromAddress}>`;

  const record = await prisma.emailSend.create({
    data: {
      userId,
      toEmail: payload.toEmail,
      toName: payload.toName,
      company: payload.company,
      subject: payload.subject,
      body: payload.body,
      status: 'pending',
    },
  });

  const firstName = payload.toName.split(' ')[0] || payload.toName;
  const vars = { firstName, company: payload.company };
  const renderedSubject = renderTemplate(payload.subject, vars);
  const renderedBody   = renderTemplate(payload.body,    vars);
  const htmlBody = buildHtml({ senderName, bodyHtml: renderedBody, sendId: record.id });

  try {
    const emailPayload: Parameters<ReturnType<typeof getResend>['emails']['send']>[0] = {
      from: fromHeader,
      to: payload.toEmail,
      subject: renderedSubject,
      html: htmlBody,
    };

    // Set reply-to to the actual sender so replies go to them, not the platform address
    if (sender?.email) {
      (emailPayload as any).reply_to = sender.email;
    }

    await getResend().emails.send(emailPayload);

    await prisma.emailSend.update({
      where: { id: record.id },
      data: { status: 'sent', sentAt: new Date() },
    });

    return { success: true, sendId: record.id };
  } catch (err: any) {
    await prisma.emailSend.update({
      where: { id: record.id },
      data: { status: 'failed' },
    });
    return { success: false, error: err?.message || 'Send failed', sendId: record.id };
  }
}

export async function getEmailHistory(userId: string) {
  return prisma.emailSend.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, toEmail: true, toName: true, company: true,
      subject: true, status: true, openCount: true, clickCount: true,
      sentAt: true, openedAt: true, createdAt: true, campaignId: true,
    },
  });
}

export async function getUserCampaigns(userId: string) {
  return prisma.emailCampaign.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { sends: true } } },
  });
}

export async function createCampaign(userId: string, data: { name: string; subject: string; body: string }) {
  return prisma.emailCampaign.create({
    data: { userId, ...data },
  });
}

export async function trackOpen(sendId: string): Promise<void> {
  try {
    const record = await prisma.emailSend.findUnique({
      where: { id: sendId },
      select: { openedAt: true },
    });
    await prisma.emailSend.update({
      where: { id: sendId },
      data: {
        openCount: { increment: 1 },
        ...(record && !record.openedAt ? { openedAt: new Date() } : {}),
      },
    });
  } catch {
    // silently ignore missing IDs / closed records
  }
}

export async function trackClick(sendId: string): Promise<void> {
  try {
    await prisma.emailSend.update({
      where: { id: sendId },
      data: { clickCount: { increment: 1 } },
    });
  } catch {
    // silently ignore missing IDs
  }
}
