import { describe, test, expect, beforeEach } from '@jest/globals';
import { SubscriptionService } from '../subscriptionService';
import storage from '../../../storage';
import { FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from '../../../types/subscriptions';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(async () => {
    service = SubscriptionService.getInstance();
    await service.resetToFree();
  });

  test('reports free tier limits by default', async () => {
    const isPrem = await service.isPremium();
    expect(isPrem).toBe(false);

    const limits = await service.getLimits();
    expect(limits.maxShortcuts).toBe(FREE_TIER_LIMITS.maxShortcuts);
    expect(limits.maxContacts).toBe(FREE_TIER_LIMITS.maxContacts);
    expect(limits.allowLocation).toBe(false);
  });

  test('unlocks unlimited limits on Sentinel Plus purchase', async () => {
    const purchaseSuccess = await service.purchasePremium('monthly');
    expect(purchaseSuccess).toBe(true);

    const isPrem = await service.isPremium();
    expect(isPrem).toBe(true);

    const limits = await service.getLimits();
    expect(limits.maxShortcuts).toBe(PREMIUM_TIER_LIMITS.maxShortcuts);
    expect(limits.allowLocation).toBe(true);
  });

  test('resets back to free tier on reset call', async () => {
    await service.purchasePremium('lifetime');
    expect(await service.isPremium()).toBe(true);

    await service.resetToFree();
    expect(await service.isPremium()).toBe(false);
  });
});
