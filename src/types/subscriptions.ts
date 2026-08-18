export type SubscriptionTier = 'free' | 'plus_monthly' | 'plus_lifetime';

export interface SubscriptionState {
  tier: SubscriptionTier;
  isPremium: boolean;
  activeEntitlements: string[];
  expirationDate?: string | null;
  willRenew?: boolean;
}

export interface PremiumLimits {
  maxShortcuts: number;
  maxContacts: number;
  maxProfiles: number;
  allowLocation: boolean;
  allowCustomMessages: boolean;
  allowAdvancedSecurity: boolean;
}

export const FREE_TIER_LIMITS: PremiumLimits = {
  maxShortcuts: 2,
  maxContacts: 1,
  maxProfiles: 1,
  allowLocation: false,
  allowCustomMessages: false,
  allowAdvancedSecurity: false,
};

export const PREMIUM_TIER_LIMITS: PremiumLimits = {
  maxShortcuts: Infinity,
  maxContacts: Infinity,
  maxProfiles: Infinity,
  allowLocation: true,
  allowCustomMessages: true,
  allowAdvancedSecurity: true,
};
