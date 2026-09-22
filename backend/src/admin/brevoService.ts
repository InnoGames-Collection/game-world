import { env } from '../config/env.js';
import pino from 'pino';

const logger = pino({ name: 'BrevoEmailService' });

export interface SendMagicLinkParams {
  toEmail: string;
  toName: string;
  magicLinkUrl: string;
  role: 'admin' | 'auditor';
}

export const brevoEmailService = {
  /**
   * Send Magic Link via Brevo Transactional Email API v3
   */
  async sendMagicLink(params: SendMagicLinkParams): Promise<{ success: boolean; message: string }> {
    const { toEmail, toName, magicLinkUrl, role } = params;

    // If Brevo API key is not configured, log clearly for administrator setup
    if (!env.BREVO_API_KEY || env.BREVO_API_KEY.trim() === '') {
      logger.warn(
        { toEmail, magicLinkUrl },
        '⚠️ BREVO_API_KEY not configured in environment. Displaying Magic Link in server logs for development/onboarding.'
      );
      console.log('\n=============================================================');
      console.log(`🔑 [ADMIN MAGIC LINK] Login for ${toName} (${toEmail}) [Role: ${role}]`);
      console.log(`🔗 Click to authenticate: ${magicLinkUrl}`);
      console.log('⏰ Valid for 15 minutes.');
      console.log('=============================================================\n');

      return {
        success: true,
        message: `Magic link generated. (Brevo API key not set; link displayed in server logs).`,
      };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
          .card { max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }
          .btn { display: inline-block; background-color: #10b981; color: #022c22; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin: 24px 0; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }
          .badge { display: inline-block; background: #064e3b; color: #34d399; font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="margin-top:0; color:#ffffff;">GoPlay Operations Console</h2>
          <span class="badge">${role === 'admin' ? 'System Administrator' : 'Telecom Auditor'}</span>
          <p style="margin-top:16px;">Hello <strong>${toName}</strong>,</p>
          <p>You requested secure access to the GoPlay Tier-0 Operations Console. Click the button below to sign in instantly.</p>
          <div style="text-align: center;">
            <a href="${magicLinkUrl}" class="btn">Sign In to Operations Console</a>
          </div>
          <p style="font-size:13px; color:#cbd5e1;">Or copy and paste this URL into your browser:<br>
            <a href="${magicLinkUrl}" style="color:#38bdf8; word-break: break-all;">${magicLinkUrl}</a>
          </p>
          <div class="footer">
            <p>This single-use magic link is valid for <strong>15 minutes</strong>. If you did not request this email, please ignore it or contact security.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: env.BREVO_SENDER_NAME,
            email: env.BREVO_SENDER_EMAIL,
          },
          to: [{ email: toEmail, name: toName }],
          subject: `GoPlay Operations Console — Sign In Link (${role.toUpperCase()})`,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        logger.error({ status: response.status, errBody }, 'Brevo API rejected email send');
        return {
          success: false,
          message: `Brevo email delivery failed (${response.status}). Please check API key settings.`,
        };
      }

      logger.info({ toEmail }, 'Magic link email sent successfully via Brevo');
      return {
        success: true,
        message: `Magic sign-in link sent to ${toEmail}. Please check your inbox.`,
      };
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to connect to Brevo API');
      return {
        success: false,
        message: 'Could not connect to Brevo email service.',
      };
    }
  },
};
