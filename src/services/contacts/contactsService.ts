import * as Contacts from 'expo-contacts';
import { EmergencyContact } from '../../types/contacts';
import storage from '../../storage';

export class ContactsService {
  private static instance: ContactsService;

  public static getInstance(): ContactsService {
    if (!ContactsService.instance) {
      ContactsService.instance = new ContactsService();
    }
    return ContactsService.instance;
  }

  /**
   * Get all emergency contacts from local storage
   */
  async getAllContacts(): Promise<EmergencyContact[]> {
    return await storage.getContacts();
  }

  /**
   * Get a contact by ID
   */
  async getContactById(id: string): Promise<EmergencyContact | null> {
    const contacts = await this.getAllContacts();
    return contacts.find((c) => c.id === id) || null;
  }

  /**
   * Add or update an emergency contact
   */
  async saveContact(
    contact: Omit<EmergencyContact, 'id' | 'createdAt'> & { id?: string }
  ): Promise<EmergencyContact> {
    const contacts = await this.getAllContacts();
    const id = contact.id || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newContact: EmergencyContact = {
      ...contact,
      id,
      createdAt: Date.now(),
    };

    // If marked as primary, unmark others
    let updatedList: EmergencyContact[];
    if (newContact.isPrimary) {
      updatedList = contacts.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }));
    } else {
      updatedList = [...contacts];
    }

    const existingIndex = updatedList.findIndex((c) => c.id === id);
    if (existingIndex >= 0) {
      updatedList[existingIndex] = newContact;
    } else {
      updatedList.push(newContact);
    }

    await storage.saveContacts(updatedList);
    return newContact;
  }

  /**
   * Delete an emergency contact
   */
  async deleteContact(id: string): Promise<void> {
    const contacts = await this.getAllContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    await storage.saveContacts(filtered);
  }

  /**
   * Request native permission and import contact from phone device contacts
   */
  async importNativeContact(): Promise<{
    name: string;
    phoneNumber: string;
  } | null> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Contacts permission denied by user');
      }

      const contact = await Contacts.presentContactPickerAsync();
      if (!contact) return null;

      const phone =
        contact.phoneNumbers && contact.phoneNumbers.length > 0
          ? contact.phoneNumbers[0].number || ''
          : '';

      const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Contact';

      return {
        name,
        phoneNumber: phone,
      };
    } catch (e) {
      console.warn('[ContactsService] Native contact picker error:', e);
      throw e;
    }
  }
}

export const contactsService = ContactsService.getInstance();
export default contactsService;
