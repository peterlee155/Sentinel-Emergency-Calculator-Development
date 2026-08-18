import { describe, test, expect, beforeEach } from '@jest/globals';
import { ContactsService } from '../contactsService';
import storage from '../../../storage';

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(async () => {
    service = ContactsService.getInstance();
    await storage.saveContacts([]);
  });

  test('saves and retrieves an emergency contact', async () => {
    const saved = await service.saveContact({
      name: 'Dr. Watson',
      phoneNumber: '+1 555 456 7890',
      relationship: 'Doctor',
      isPrimary: true,
    });

    expect(saved.id).toBeDefined();
    expect(saved.name).toBe('Dr. Watson');

    const all = await service.getAllContacts();
    const found = all.find((c) => c.id === saved.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Dr. Watson');
    expect(found?.isPrimary).toBe(true);
  });

  test('enforces single primary contact rule', async () => {
    const c1 = await service.saveContact({
      name: 'Contact 1',
      phoneNumber: '+111111111',
      relationship: 'Friend',
      isPrimary: true,
    });

    const c2 = await service.saveContact({
      name: 'Contact 2',
      phoneNumber: '+222222222',
      relationship: 'Family',
      isPrimary: true,
    });

    const all = await service.getAllContacts();
    const primaryContacts = all.filter((c) => c.isPrimary);
    expect(primaryContacts.length).toBe(1);
    expect(primaryContacts[0].id).toBe(c2.id);
  });

  test('deletes an emergency contact', async () => {
    const saved = await service.saveContact({
      name: 'Temporary Contact',
      phoneNumber: '+19998887777',
      relationship: 'Other',
    });

    let all = await service.getAllContacts();
    expect(all.some((c) => c.id === saved.id)).toBe(true);

    await service.deleteContact(saved.id);
    all = await service.getAllContacts();
    expect(all.some((c) => c.id === saved.id)).toBe(false);
  });
});
