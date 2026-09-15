import { query } from '../config/database.js';
import { authService } from './authService.js';
import { smsService } from './smsService.js';
import { normalizeEthiopianPhone } from '../utils/msisdn.js';
import { SubscriptionPlan, UserProfile } from '../types/domain.js';
import pino from 'pino';

const logger = pino({ name: 'SubscriptionService' });

export interface PlanDetails {
  id: SubscriptionPlan;
  title: string;
  name: string;
  priceETB: number;
  durationLabel: string;
  durationDays: number;
  smsRecipient: string;
  smsShortcode: string;
  smsBody: string;
  unsubscribeBody: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: 'daily',
    title: 'Daily Pass',
    name: 'Daily Pass',
    priceETB: 5,
    durationLabel: '24 Hours (5 ETB)',
    durationDays: 1,
    smsRecipient: '977',
    smsShortcode: '977',
    smsBody: '1',
    unsubscribeBody: 'STOP 1',
    badge: 'Daily',
    features: ['Unlimited match plays for 24h', 'Direct tournament entries', 'Billed via Airtime to 977'],
  },
  {
    id: 'weekly',
    title: 'Weekly Pass',
    name: 'Weekly Pass',
    priceETB: 15,
    durationLabel: '7 Days (15 ETB)',
    durationDays: 7,
    smsRecipient: '977',
    smsShortcode: '977',
    smsBody: '2',
    unsubscribeBody: 'STOP 2',
    popular: true,
    recommended: true,
    badge: 'Popular',
    features: ['Unlimited match plays for 7 days', 'Access to weekly championship pools', 'Billed via Airtime to 977'],
  },
  {
    id: 'monthly',
    title: 'Monthly Pass',
    name: 'Monthly Pass',
    priceETB: 35,
    durationLabel: '30 Days (35 ETB)',
    durationDays: 30,
    smsRecipient: '977',
    smsShortcode: '977',
    smsBody: '3',
    unsubscribeBody: 'STOP 3',
    badge: 'Best Value',
    features: ['Unlimited match plays for 30 days', 'Grand monthly cup entry unlocked', 'Best value gaming access'],
  },
];

export const subscriptionService = {
  getPlans(): PlanDetails[] {
    return SUBSCRIPTION_PLANS;
  },

  async subscribe(
    userId: string,
    plan: SubscriptionPlan
  ): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
    const planDetail = SUBSCRIPTION_PLANS.find((p) => p.id === plan);
    if (!planDetail) {
      return { success: false, message: 'Invalid subscription plan selected.' };
    }

    const durationMs = planDetail.durationDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);

    const userRes = await query('SELECT phone FROM profiles WHERE id = $1', [userId]);
    const phone = userRes.rows[0]?.phone || '';

    // Record / Update subscription in PostgreSQL
    await query(
      `INSERT INTO subscriptions (user_id, msisdn, service_id, plan, is_active, auto_renew, expires_at)
       VALUES ($1, $2, 4, $3, TRUE, TRUE, $4)
       ON CONFLICT (msisdn, service_id) DO UPDATE
         SET user_id = EXCLUDED.user_id, is_active = TRUE, plan = EXCLUDED.plan,
             expires_at = EXCLUDED.expires_at, auto_renew = TRUE`,
      [userId, phone, plan, expiresAt]
    );

    // Initial 25 coins bonus on first subscription
    const pCheck = await query('SELECT has_received_initial_coins FROM profiles WHERE id = $1', [userId]);
    if (pCheck.rows[0] && !pCheck.rows[0].has_received_initial_coins) {
      await query('SELECT apply_coins($1, 25, $2, $3)', [userId, 'Initial VIP Subscriber Bonus', 'BONUS_SUB']);
      await query('UPDATE profiles SET has_received_initial_coins = TRUE WHERE id = $1', [userId]);
    }

    const updatedProfile = await authService.getProfile(userId);

    return {
      success: true,
      message: `Subscription prompt initiated for ${planDetail.title}. Send '${planDetail.smsBody}' to ${planDetail.smsRecipient} to confirm activation via Airtime.`,
      profile: updatedProfile!,
    };
  },

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string; profile: UserProfile }> {
    await query(
      `UPDATE subscriptions SET auto_renew = FALSE, cancelled_at = NOW() WHERE user_id = $1`,
      [userId]
    );

    const profile = (await authService.getProfile(userId))!;

    return {
      success: true,
      message: 'Automatic subscription renewal disabled. Your active pass will remain valid until expiration.',
      profile,
    };
  },

  /**
   * Handle Partner Subscription / Unsubscription Webhook
   */
  async handlePartnerWebhook(payload: {
    event: 'subscription' | 'unsubscription';
    request_id: string;
    service_id: number;
    msisdn: string;
    time: string;
  }): Promise<{ success: boolean; message: string }> {
    const { event, request_id, service_id, msisdn, time } = payload;
    const { e164 } = normalizeEthiopianPhone(msisdn);

    // Check duplicate request
    const existing = await query('SELECT id FROM portal_events WHERE request_id = $1', [request_id]);
    if (existing.rowCount && existing.rowCount > 0) {
      return { success: true, message: 'Webhook already processed (idempotent)' };
    }

    // Determine plan from service_id
    const plan = service_id === 1 ? 'daily' : service_id === 2 ? 'weekly' : 'monthly';
    const durationDays = plan === 'daily' ? 1 : plan === 'weekly' ? 7 : 30;

    // Check if user already registered
    const userRes = await query('SELECT id FROM profiles WHERE phone = $1', [e164]);
    const userId = userRes.rows[0]?.id || null;

    if (event === 'subscription') {
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      await query(
        `INSERT INTO subscriptions (user_id, msisdn, service_id, plan, is_active, auto_renew, expires_at)
         VALUES ($1, $2, $3, $4, TRUE, TRUE, $5)
         ON CONFLICT (msisdn, service_id) DO UPDATE
           SET is_active = TRUE, plan = EXCLUDED.plan, expires_at = EXCLUDED.expires_at, auto_renew = TRUE`,
        [userId, e164, service_id, plan, expiresAt]
      );

      // Send Welcome MT SMS
      await smsService.sendMt({
        msisdn,
        type: 'optin',
        message: 'Welcome to GAMEON TELE! Your VIP Gaming Pass is active. Play unlimited matches now!',
      });
    } else if (event === 'unsubscription') {
      await query(
        `UPDATE subscriptions SET is_active = FALSE, auto_renew = FALSE, cancelled_at = NOW()
          WHERE msisdn = $1 AND service_id = $2`,
        [e164, service_id]
      );
    }

    // Record audit event
    await query(
      `INSERT INTO portal_events (event, request_id, service_id, msisdn, event_time, raw_payload, processed)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [event, request_id, service_id, e164, time, JSON.stringify(payload)]
    );

    return { success: true, message: 'Subscription event recorded successfully' };
  },
};
