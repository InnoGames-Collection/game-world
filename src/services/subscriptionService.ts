/**
 * telebirr VIP Gaming Subscription Service
 * Manages VIP Gaming Passes billed strictly via TeleBirr Direct Connect.
 */

import { SubscriptionPlan, UserProfile } from '../types';
import { StorageService } from './storageService';
import { apiService } from './apiService';

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
    features: [
      'Unlimited free games access for 24h',
      'Exclusive VIP avatar badges',
      'telebirr Instant Billing',
    ],
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
    features: [
      'Unlimited free games access for 7 days',
      'Double XP leveling speed',
      'telebirr Instant Billing',
    ],
  },
  {
    id: 'monthly',
    title: 'Monthly Pass',
    name: 'Monthly Pass',
    priceETB: 50,
    durationLabel: '30 Days (50 ETB)',
    durationDays: 30,
    badge: 'Best Value',
    features: [
      'Unlimited free games access for 30 days',
      'Exclusive Champion VIP badge',
      'telebirr Instant Billing',
    ],
  },
];

export const SubscriptionService = {
  getPlans(): PlanDetails[] {
    return SUBSCRIPTION_PLANS;
  },

  async subscribe(plan: SubscriptionPlan): Promise<{ success: boolean; message: string; checkoutUrl?: string; profile?: UserProfile }> {
    const current = StorageService.getProfile();
    const planDetail = SUBSCRIPTION_PLANS.find(p => p.id === plan);

    if (!planDetail) {
      return { success: false, message: 'Invalid subscription plan chosen.' };
    }

    // Call real TeleBirr checkout API
    const res = await apiService.activateSubscription(plan);

    const durationDays = plan === 'daily' ? 1 : plan === 'weekly' ? 7 : 30;
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;

    const updated: UserProfile = {
      ...current,
      subscription: {
        plan,
        isActive: true,
        expiresAt,
        autoRenew: true,
      },
    };

    StorageService.saveProfile(updated);

    return {
      success: res.success,
      checkoutUrl: res.checkoutUrl,
      message: res.checkoutUrl 
        ? `Redirecting to telebirr to confirm ${planDetail.title} (${planDetail.priceETB} ETB)...`
        : `VIP ${planDetail.title} activated successfully!`,
      profile: updated,
    };
  },

  cancelSubscription(plan?: SubscriptionPlan): { success: boolean; message: string; profile: UserProfile } {
    const current = StorageService.getProfile();

    const updated: UserProfile = {
      ...current,
      subscription: {
        ...current.subscription,
        autoRenew: false,
      },
    };

    StorageService.saveProfile(updated);

    return {
      success: true,
      message: 'Automatic subscription renewal disabled. Pass remains active until expiration.',
      profile: updated,
    };
  },
};
