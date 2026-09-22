import { query } from '../config/database.js';
import { authService } from './authService.js';
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
    priceETB: 10,
    durationLabel: '24 Hours (10 ETB)',
    durationDays: 1,
    badge: 'Daily',
    features: ['Unlimited free games access for 24h', 'Exclusive VIP avatar badges', 'telebirr Instant Billing'],
  },
  {
    id: 'weekly',
    title: 'Weekly Pass',
    name: 'Weekly Pass',
    priceETB: 25,
    durationLabel: '7 Days (25 ETB)',
    durationDays: 7,
    popular: true,
    recommended: true,
    badge: 'Popular',
    features: ['Unlimited free games access for 7 days', 'Double XP leveling speed', 'telebirr Instant Billing'],
  },
  {
    id: 'monthly',
    title: 'Monthly Pass',
    name: 'Monthly Pass',
    priceETB: 50,
    durationLabel: '30 Days (50 ETB)',
    durationDays: 30,
    badge: 'Best Value',
    features: ['Unlimited free games access for 30 days', 'Exclusive Champion VIP badge', 'telebirr Instant Billing'],
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
    return this.activatePlanForUser(userId, plan);
  },

  async activatePlanForUser(
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

    const updatedProfile = await authService.getProfile(userId);
    logger.info({ userId, plan, expiresAt }, 'Subscription activated via TeleBirr');

    return {
      success: true,
      message: `Successfully activated ${planDetail.title} via telebirr!`,
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
};
