/**
 * EthioTelecom Subscription Service
 * Manages VIP Gaming Passes billed directly via TeleBirr or Airtime Credit.
 */

import { SubscriptionPlan, UserProfile } from '../types';
import { StorageService } from './storageService';

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

export const getSmsUrl = (smsRecipient: string, smsBody: string): string => {
  return `sms:${smsRecipient}?body=${encodeURIComponent(smsBody)}`;
};

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
    features: [
      'Unlimited match plays for 24h',
      'Direct tournament entries',
      'Billed via Airtime to 977',
    ],
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
    features: [
      'Unlimited match plays for 7 days',
      'Access to weekly championship pools',
      'Billed via Airtime to 977',
    ],
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
    features: [
      'Unlimited match plays for 30 days',
      'Grand monthly cup entry unlocked',
      'Best value gaming access',
    ],
  },
];

export const SubscriptionService = {
  getPlans(): PlanDetails[] {
    return SUBSCRIPTION_PLANS;
  },

  getSmsUrl(smsRecipient: string, smsBody: string): string {
    return `sms:${smsRecipient}?body=${encodeURIComponent(smsBody)}`;
  },

  async subscribe(plan: SubscriptionPlan): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
    const current = StorageService.getProfile();
    const planDetail = SUBSCRIPTION_PLANS.find(p => p.id === plan);

    if (!planDetail) {
      return { success: false, message: 'Invalid subscription plan chosen.' };
    }

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
      success: true,
      message: `Subscription prompt initiated for ${planDetail.title}. Send '${planDetail.smsBody}' to ${planDetail.smsRecipient} to confirm activation via Airtime.`,
      profile: updated,
    };
  },

  cancelSubscription(plan?: SubscriptionPlan): { success: boolean; message: string; profile: UserProfile } {
    const current = StorageService.getProfile();
    const targetPlan = plan || current.subscription?.plan || 'weekly';
    const planDetail = SUBSCRIPTION_PLANS.find(p => p.id === targetPlan) || SUBSCRIPTION_PLANS[1];

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
      message: `To complete cancellation, send '${planDetail.unsubscribeBody}' to ${planDetail.smsRecipient}.`,
      profile: updated,
    };
  },
};
