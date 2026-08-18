import { Platform } from 'react-native';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import {
  SubscriptionState,
  SubscriptionTier,
  FREE_TIER_LIMITS,
  PREMIUM_TIER_LIMITS,
  PremiumLimits,
} from '../../types/subscriptions';
import storage from '../../storage';

export const REVENUECAT_CONFIG = {
  apiKeyAndroid: process.env.EXPO_PUBLIC_RC_ANDROID_KEY || 'goog_sentinel_mock_key',
  apiKeyIos: process.env.EXPO_PUBLIC_RC_IOS_KEY || 'appl_sentinel_mock_key',
  entitlementId: 'sentinel_plus',
};

export class SubscriptionService {
  private static instance: SubscriptionService;
  private isConfigured = false;

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Initialize RevenueCat SDK
   */
  public async initialize(): Promise<void> {
    if (this.isConfigured || Platform.OS === 'web') return;

    try {
      const apiKey =
        Platform.OS === 'ios'
          ? REVENUECAT_CONFIG.apiKeyIos
          : REVENUECAT_CONFIG.apiKeyAndroid;

      if (apiKey && !apiKey.includes('mock')) {
        Purchases.configure({ apiKey });
        this.isConfigured = true;
      }
    } catch (e) {
      console.warn('[SubscriptionService] RevenueCat init failed:', e);
    }
  }

  /**
   * Check whether the user currently has an active Premium entitlement
   */
  public async isPremium(): Promise<boolean> {
    const localState = await storage.getSubscription();
    if (localState.isPremium) return true;

    if (this.isConfigured && Platform.OS !== 'web') {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const hasEntitlement =
          customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId] !==
          undefined;

        if (hasEntitlement !== localState.isPremium) {
          await storage.saveSubscription({
            ...localState,
            isPremium: hasEntitlement,
            tier: hasEntitlement ? 'plus_monthly' : 'free',
          });
        }
        return hasEntitlement;
      } catch (e) {
        console.warn('[SubscriptionService] Error fetching customer info:', e);
      }
    }

    return localState.isPremium;
  }

  /**
   * Get active limits based on current subscription tier
   */
  public async getLimits(): Promise<PremiumLimits> {
    const premium = await this.isPremium();
    return premium ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
  }

  /**
   * Purchase Sentinel Plus package
   */
  public async purchasePremium(packageType: 'monthly' | 'lifetime' = 'monthly'): Promise<boolean> {
    if (this.isConfigured && Platform.OS !== 'web') {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
          const pkg = offerings.current.availablePackages[0];
          const { customerInfo } = await Purchases.purchasePackage(pkg);
          const isEntitled =
            customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId] !==
            undefined;

          if (isEntitled) {
            await storage.saveSubscription({
              tier: packageType === 'lifetime' ? 'plus_lifetime' : 'plus_monthly',
              isPremium: true,
              activeEntitlements: [REVENUECAT_CONFIG.entitlementId],
            });
            return true;
          }
        }
      } catch (e: any) {
        if (e.userCancelled) {
          return false;
        }
        console.warn('[SubscriptionService] Purchase failed:', e);
      }
    }

    // Local / Demo activation fallback
    await storage.saveSubscription({
      tier: packageType === 'lifetime' ? 'plus_lifetime' : 'plus_monthly',
      isPremium: true,
      activeEntitlements: [REVENUECAT_CONFIG.entitlementId],
    });
    return true;
  }

  /**
   * Restore existing purchases
   */
  public async restorePurchases(): Promise<boolean> {
    if (this.isConfigured && Platform.OS !== 'web') {
      try {
        const customerInfo = await Purchases.restorePurchases();
        const hasEntitlement =
          customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId] !==
          undefined;

        await storage.saveSubscription({
          tier: hasEntitlement ? 'plus_monthly' : 'free',
          isPremium: hasEntitlement,
          activeEntitlements: hasEntitlement ? [REVENUECAT_CONFIG.entitlementId] : [],
        });
        return hasEntitlement;
      } catch (e) {
        console.warn('[SubscriptionService] Restore purchases failed:', e);
        return false;
      }
    }

    const state = await storage.getSubscription();
    return state.isPremium;
  }

  /**
   * Get raw customer info
   */
  public async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (this.isConfigured && Platform.OS !== 'web') {
      try {
        return await Purchases.getCustomerInfo();
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Downgrade / Reset to free tier (useful for testing)
   */
  public async resetToFree(): Promise<void> {
    await storage.saveSubscription({
      tier: 'free',
      isPremium: false,
      activeEntitlements: [],
      expirationDate: null,
    });
  }
}

export const subscriptionService = SubscriptionService.getInstance();
export default subscriptionService;
