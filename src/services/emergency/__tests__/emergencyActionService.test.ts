import { describe, test, expect, beforeEach } from '@jest/globals';
import { EmergencyActionService } from '../emergencyActionService';
import storage from '../../../storage';

describe('EmergencyActionService Safe Simulation', () => {
  let service: EmergencyActionService;

  beforeEach(async () => {
    service = EmergencyActionService.getInstance();
    await storage.saveContacts([
      {
        id: 'contact_mom',
        name: 'Mom',
        phoneNumber: '+15551234567',
        relationship: 'Family',
        isPrimary: true,
        createdAt: Date.now(),
      },
    ]);
  });

  test('executes safe simulation for CALL_CONTACT without placing real calls', async () => {
    const report = await service.executeShortcut(
      {
        id: 'sc_call_mom',
        name: 'Call Mom',
        trigger: '123123123',
        actionType: 'CALL_CONTACT',
        contactIds: ['contact_mom'],
        enabled: true,
        requireConfirmation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      true // isSimulation = true
    );

    expect(report.isSimulation).toBe(true);
    expect(report.overallStatus).toBe('SUCCESS');
    expect(report.targetContacts.length).toBe(1);
    expect(report.targetContacts[0].name).toBe('Mom');

    const simStep = report.steps.find((s) => s.step.includes('SIMULATION'));
    expect(simStep).toBeDefined();
    expect(simStep?.message).toContain('Would initiate phone call to Mom');
  });

  test('executes safe simulation for SEND_SMS with custom text', async () => {
    const report = await service.executeShortcut(
      {
        id: 'sc_sms_sos',
        name: 'SMS Alert',
        trigger: '456456456',
        actionType: 'SEND_SMS',
        contactIds: ['contact_mom'],
        message: 'I am at the train station and need pickup.',
        enabled: true,
        requireConfirmation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      true // isSimulation = true
    );

    expect(report.isSimulation).toBe(true);
    expect(report.overallStatus).toBe('SUCCESS');
    expect(report.preparedMessage).toContain('I am at the train station');
  });

  test('handles missing contacts gracefully', async () => {
    await storage.saveContacts([]); // clear contacts
    const report = await service.executeShortcut(
      {
        id: 'sc_no_contacts',
        name: 'Empty Alert',
        trigger: '999999',
        actionType: 'CALL_CONTACT',
        contactIds: [],
        enabled: true,
        requireConfirmation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      true
    );

    expect(report.overallStatus).toBe('FAILED');
    expect(report.error).toContain('No contact');
  });
});
