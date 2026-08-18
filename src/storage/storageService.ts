import { AsyncStorageImpl } from './AsyncStorageImpl';
import { SecureStorageImpl } from './SecureStorageImpl';
import {
  EmergencyShortcut,
  EmergencyContact,
  EmergencyProfile,
  SubscriptionState,
  CalculationHistoryItem,
  CalculatorPreferences,
  DEFAULT_CALCULATOR_PREFERENCES,
} from '../types';

export const STORAGE_KEYS = {
  CALCULATOR_HISTORY: 'sentinel_calculator_history',
  CALCULATOR_PREFS: 'sentinel_calculator_prefs',
  SHORTCUTS: 'sentinel_shortcuts',
  CONTACTS: 'sentinel_contacts',
  PROFILES: 'sentinel_profiles',
  ACTIVE_PROFILE_ID: 'sentinel_active_profile_id',
  SUBSCRIPTION: 'sentinel_subscription',
  THEME_MODE: 'sentinel_theme_mode',
  INITIAL_SEEDED: 'sentinel_initial_seeded_v2',
  // Secure keys
  SECURITY_PIN: 'sentinel_sec_pin',
  BIOMETRICS_ENABLED: 'sentinel_sec_biometrics',
  AUTO_LOCK_TIME: 'sentinel_sec_autolock',
};

class StorageService {
  private static instance: StorageService;
  private asyncStore = new AsyncStorageImpl();
  private secureStore = new SecureStorageImpl();

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * One-time seed for first app installation
   */
  private async ensureInitialSeed(): Promise<void> {
    const isSeeded = await this.asyncStore.getItem<boolean>(STORAGE_KEYS.INITIAL_SEEDED);
    if (!isSeeded) {
      const defaultContacts: EmergencyContact[] = [
        {
          id: 'contact_mom_default',
          name: 'Mom',
          phoneNumber: '+1 555 123 4567',
          relationship: 'Family',
          isPrimary: true,
          createdAt: Date.now(),
        },
      ];
      await this.asyncStore.setItem(STORAGE_KEYS.CONTACTS, defaultContacts);

      const defaultShortcuts: EmergencyShortcut[] = [
        {
          id: 'sc_call_mom_default',
          name: 'Call Mom',
          trigger: '123123123',
          enabled: true,
          actionType: 'CALL_CONTACT',
          actionTypes: ['CALL_CONTACT'],
          executionMode: 'CONFIRMATION',
          contactIds: ['contact_mom_default'],
          requireConfirmation: true,
          includeLocation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sc_sos_sms_default',
          name: 'Send Emergency SMS + Location',
          trigger: '456456456',
          enabled: true,
          actionType: 'SEND_SMS',
          actionTypes: ['SEND_SMS', 'SEND_LOCATION'],
          executionMode: 'CONFIRMATION',
          contactIds: ['contact_mom_default'],
          message: 'EMERGENCY: I need assistance. Here is my current location: {location}',
          requireConfirmation: true,
          includeLocation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      await this.asyncStore.setItem(STORAGE_KEYS.SHORTCUTS, defaultShortcuts);

      const defaultProfiles: EmergencyProfile[] = [
        {
          id: 'profile_default',
          name: 'Home',
          description: 'Standard home safety profile',
          isActive: true,
          shortcutIds: ['sc_call_mom_default', 'sc_sos_sms_default'],
          color: '#0A84FF',
          icon: 'home',
        },
        {
          id: 'profile_travel',
          name: 'Travel',
          description: 'Active when commuting or traveling',
          isActive: false,
          shortcutIds: ['sc_sos_sms_default'],
          color: '#FF9F0A',
          icon: 'travel',
        },
        {
          id: 'profile_night',
          name: 'Night',
          description: 'Enhanced alert level for evening/night',
          isActive: false,
          shortcutIds: ['sc_call_mom_default'],
          color: '#AF52DE',
          icon: 'night',
        },
        {
          id: 'profile_work',
          name: 'Work',
          description: 'Discreet profile for office/workplace',
          isActive: false,
          shortcutIds: ['sc_sos_sms_default'],
          color: '#30D158',
          icon: 'work',
        },
      ];
      await this.asyncStore.setItem(STORAGE_KEYS.PROFILES, defaultProfiles);

      await this.asyncStore.setItem(STORAGE_KEYS.INITIAL_SEEDED, true);
    }
  }

  // --- Calculator Preferences & Camouflage ---
  async getCalculatorPreferences(): Promise<CalculatorPreferences> {
    const prefs = await this.asyncStore.getItem<CalculatorPreferences>(
      STORAGE_KEYS.CALCULATOR_PREFS
    );
    return { ...DEFAULT_CALCULATOR_PREFERENCES, ...(prefs || {}) };
  }

  async saveCalculatorPreferences(
    prefs: Partial<CalculatorPreferences>
  ): Promise<CalculatorPreferences> {
    const current = await this.getCalculatorPreferences();
    const updated = { ...current, ...prefs };
    await this.asyncStore.setItem(STORAGE_KEYS.CALCULATOR_PREFS, updated);
    return updated;
  }

  // --- Calculator History ---
  async getCalculationHistory(): Promise<CalculationHistoryItem[]> {
    const history = await this.asyncStore.getItem<CalculationHistoryItem[]>(
      STORAGE_KEYS.CALCULATOR_HISTORY
    );
    return history || [];
  }

  async saveCalculation(item: CalculationHistoryItem): Promise<void> {
    const history = await this.getCalculationHistory();
    const prefs = await this.getCalculatorPreferences();
    if (!prefs.keepHistory) return;

    const maxItems = prefs.maxHistoryItems || 50;
    const updated = [item, ...history.slice(0, maxItems - 1)];
    await this.asyncStore.setItem(STORAGE_KEYS.CALCULATOR_HISTORY, updated);
  }

  async clearCalculationHistory(): Promise<void> {
    await this.asyncStore.removeItem(STORAGE_KEYS.CALCULATOR_HISTORY);
  }

  // --- Shortcuts ---
  async getShortcuts(): Promise<EmergencyShortcut[]> {
    await this.ensureInitialSeed();
    const shortcuts = await this.asyncStore.getItem<EmergencyShortcut[]>(
      STORAGE_KEYS.SHORTCUTS
    );
    return shortcuts || [];
  }

  async saveShortcuts(shortcuts: EmergencyShortcut[]): Promise<void> {
    await this.asyncStore.setItem(STORAGE_KEYS.SHORTCUTS, shortcuts);
  }

  // --- Contacts ---
  async getContacts(): Promise<EmergencyContact[]> {
    await this.ensureInitialSeed();
    const contacts = await this.asyncStore.getItem<EmergencyContact[]>(
      STORAGE_KEYS.CONTACTS
    );
    return contacts || [];
  }

  async saveContacts(contacts: EmergencyContact[]): Promise<void> {
    await this.asyncStore.setItem(STORAGE_KEYS.CONTACTS, contacts);
  }

  // --- Profiles (Full CRUD) ---
  async getProfiles(): Promise<EmergencyProfile[]> {
    await this.ensureInitialSeed();
    const profiles = await this.asyncStore.getItem<EmergencyProfile[]>(
      STORAGE_KEYS.PROFILES
    );
    return profiles || [];
  }

  async getActiveProfile(): Promise<EmergencyProfile | null> {
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.isActive) || profiles[0] || null;
  }

  async saveProfile(
    profileData: Omit<EmergencyProfile, 'id'> & { id?: string }
  ): Promise<EmergencyProfile> {
    const profiles = await this.getProfiles();
    const id = profileData.id || `profile_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProfile: EmergencyProfile = {
      ...profileData,
      id,
      createdAt: profileData.createdAt || Date.now(),
    };

    let updatedList: EmergencyProfile[];
    if (newProfile.isActive) {
      updatedList = profiles.map((p) => ({
        ...p,
        isActive: p.id === id,
      }));
    } else {
      updatedList = [...profiles];
    }

    const existingIndex = updatedList.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      updatedList[existingIndex] = newProfile;
    } else {
      updatedList.push(newProfile);
    }

    await this.saveProfiles(updatedList);
    return newProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    const profiles = await this.getProfiles();
    const filtered = profiles.filter((p) => p.id !== id);
    if (filtered.length > 0 && !filtered.some((p) => p.isActive)) {
      filtered[0].isActive = true;
    }
    await this.saveProfiles(filtered);
  }

  async saveProfiles(profiles: EmergencyProfile[]): Promise<void> {
    await this.asyncStore.setItem(STORAGE_KEYS.PROFILES, profiles);
  }

  // --- Subscription ---
  async getSubscription(): Promise<SubscriptionState> {
    const sub = await this.asyncStore.getItem<SubscriptionState>(
      STORAGE_KEYS.SUBSCRIPTION
    );
    return (
      sub || {
        tier: 'free',
        isPremium: false,
        activeEntitlements: [],
        expirationDate: null,
      }
    );
  }

  async saveSubscription(state: SubscriptionState): Promise<void> {
    await this.asyncStore.setItem(STORAGE_KEYS.SUBSCRIPTION, state);
  }

  // --- Secure Storage (PIN & Biometrics) ---
  async getSecurityPin(): Promise<string | null> {
    return await this.secureStore.getSecureItem(STORAGE_KEYS.SECURITY_PIN);
  }

  async setSecurityPin(pin: string): Promise<void> {
    await this.secureStore.setSecureItem(STORAGE_KEYS.SECURITY_PIN, pin);
  }

  async removeSecurityPin(): Promise<void> {
    await this.secureStore.removeSecureItem(STORAGE_KEYS.SECURITY_PIN);
  }

  async isBiometricsEnabled(): Promise<boolean> {
    const val = await this.secureStore.getSecureItem(STORAGE_KEYS.BIOMETRICS_ENABLED);
    return val === 'true';
  }

  async setBiometricsEnabled(enabled: boolean): Promise<void> {
    await this.secureStore.setSecureItem(
      STORAGE_KEYS.BIOMETRICS_ENABLED,
      enabled ? 'true' : 'false'
    );
  }
}

export const storage = StorageService.getInstance();
export default storage;
