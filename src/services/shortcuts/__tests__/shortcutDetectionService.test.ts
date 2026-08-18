import { describe, test, expect, beforeEach } from '@jest/globals';
import { ShortcutDetectionService } from '../shortcutDetectionService';
import storage from '../../../storage';

describe('ShortcutDetectionService', () => {
  let service: ShortcutDetectionService;

  beforeEach(async () => {
    service = ShortcutDetectionService.getInstance();
    await storage.saveShortcuts([
      {
        id: 'sc_test_1',
        name: 'Call Mom',
        trigger: '123123123',
        actionType: 'CALL_CONTACT',
        enabled: true,
        requireConfirmation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'sc_test_2',
        name: 'Send SMS SOS',
        trigger: '456456456',
        actionType: 'SEND_SMS',
        enabled: true,
        requireConfirmation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
  });

  test('validates minimum trigger length (>= 2 digits)', async () => {
    const res1 = await service.validateTrigger('7');
    expect(res1.isValid).toBe(false);
    expect(res1.errorMessage).toContain('at least 2 digits');

    const res2 = await service.validateTrigger('9876');
    expect(res2.isValid).toBe(true);
  });

  test('rejects non-numeric triggers', async () => {
    const res = await service.validateTrigger('1234a');
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toContain('only digits');
  });

  test('detects exact duplicate triggers', async () => {
    const res = await service.validateTrigger('123123123');
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toContain('already used by shortcut "Call Mom"');
    expect(res.conflictShortcutId).toBe('sc_test_1');
  });

  test('detects overlapping/conflicting trigger suffixes', async () => {
    const res = await service.validateTrigger('99123123123');
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toContain('overlaps with existing trigger');
  });

  test('allows editing existing shortcut without self-conflict', async () => {
    const res = await service.validateTrigger('123123123', 'sc_test_1');
    expect(res.isValid).toBe(true);
  });
});
