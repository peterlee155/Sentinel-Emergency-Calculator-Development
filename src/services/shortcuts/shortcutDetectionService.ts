import { EmergencyShortcut, TriggerValidationResult } from '../../types/shortcuts';
import storage from '../../storage';
import { shortcutBuffer } from './shortcutBuffer';

export type ShortcutTriggerHandler = (
  shortcut: EmergencyShortcut,
  requireConfirmation: boolean
) => void;

export type UnlockTriggerHandler = () => void;

export class ShortcutDetectionService {
  private static instance: ShortcutDetectionService;
  private triggerHandlers: ShortcutTriggerHandler[] = [];
  private unlockHandlers: UnlockTriggerHandler[] = [];
  private isProcessing: boolean = false;

  public static getInstance(): ShortcutDetectionService {
    if (!ShortcutDetectionService.instance) {
      ShortcutDetectionService.instance = new ShortcutDetectionService();
    }
    return ShortcutDetectionService.instance;
  }

  /**
   * Validate a trigger code against existing shortcuts
   */
  public async validateTrigger(
    trigger: string,
    currentShortcutId?: string
  ): Promise<TriggerValidationResult> {
    const sanitized = trigger.trim();

    if (!/^\d+$/.test(sanitized)) {
      return {
        isValid: false,
        errorMessage: 'Trigger sequence must contain only digits (0-9).',
      };
    }

    if (sanitized.length < 2) {
      return {
        isValid: false,
        errorMessage: 'Trigger sequence must be at least 2 digits long.',
      };
    }

    const shortcuts = await storage.getShortcuts();

    // Check for exact duplicate
    const exactMatch = shortcuts.find(
      (s) => s.trigger === sanitized && s.id !== currentShortcutId
    );
    if (exactMatch) {
      return {
        isValid: false,
        errorMessage: `Trigger "${sanitized}" is already used by shortcut "${exactMatch.name}".`,
        conflictShortcutId: exactMatch.id,
      };
    }

    // Check for prefix/suffix ambiguity with existing shortcuts
    const conflict = shortcuts.find(
      (s) =>
        s.id !== currentShortcutId &&
        (s.trigger.endsWith(sanitized) || sanitized.endsWith(s.trigger))
    );
    if (conflict) {
      return {
        isValid: false,
        errorMessage: `Trigger "${sanitized}" overlaps with existing trigger "${conflict.trigger}" (${conflict.name}).`,
        conflictShortcutId: conflict.id,
      };
    }

    return { isValid: true };
  }

  /**
   * Save or update a shortcut
   */
  public async saveShortcut(
    shortcutData: Omit<EmergencyShortcut, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
    }
  ): Promise<EmergencyShortcut> {
    const validation = await this.validateTrigger(
      shortcutData.trigger,
      shortcutData.id
    );
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    const shortcuts = await storage.getShortcuts();
    const id =
      shortcutData.id ||
      `sc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newShortcut: EmergencyShortcut = {
      ...shortcutData,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const existingIndex = shortcuts.findIndex((s) => s.id === id);
    let updated: EmergencyShortcut[];
    if (existingIndex >= 0) {
      updated = [...shortcuts];
      updated[existingIndex] = newShortcut;
    } else {
      updated = [...shortcuts, newShortcut];
    }

    await storage.saveShortcuts(updated);
    return newShortcut;
  }

  /**
   * Toggle shortcut enabled/disabled status
   */
  public async toggleShortcut(id: string, enabled: boolean): Promise<void> {
    const shortcuts = await storage.getShortcuts();
    const updated = shortcuts.map((s) =>
      s.id === id ? { ...s, enabled, updatedAt: Date.now() } : s
    );
    await storage.saveShortcuts(updated);
  }

  /**
   * Delete a shortcut
   */
  public async deleteShortcut(id: string): Promise<void> {
    const shortcuts = await storage.getShortcuts();
    const updated = shortcuts.filter((s) => s.id !== id);
    await storage.saveShortcuts(updated);
  }

  /**
   * Register a trigger match handler
   */
  public onTrigger(handler: ShortcutTriggerHandler): () => void {
    this.triggerHandlers.push(handler);
    return () => {
      this.triggerHandlers = this.triggerHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Register a secret unlock handler
   */
  public onSecretUnlock(handler: UnlockTriggerHandler): () => void {
    this.unlockHandlers.push(handler);
    return () => {
      this.unlockHandlers = this.unlockHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Check rolling sequence buffer for any matching active shortcuts or secret unlock code
   */
  public async checkBuffer(): Promise<EmergencyShortcut | null> {
    if (this.isProcessing) return null;

    const bufferContent = shortcutBuffer.getBuffer();
    if (!bufferContent) return null;

    // 1. Check Secret Unlock Code (for Camouflage mode)
    const prefs = await storage.getCalculatorPreferences();
    const cleanUnlockCode = (prefs.secretUnlockCode || '0000=').replace(/=/g, '');
    if (cleanUnlockCode && bufferContent.endsWith(cleanUnlockCode)) {
      this.isProcessing = true;
      shortcutBuffer.clear();
      this.unlockHandlers.forEach((handler) => {
        try {
          handler();
        } catch (e) {
          console.error('[ShortcutDetectionService] Error in unlock handler:', e);
        }
      });
      setTimeout(() => {
        this.isProcessing = false;
      }, 1000);
      return null;
    }

    // 2. Check Active Profile and Filter Shortcuts
    const activeProfile = await storage.getActiveProfile();
    const shortcuts = await storage.getShortcuts();
    const activeShortcuts = shortcuts.filter((s) => {
      if (!s.enabled) return false;
      if (activeProfile && s.profileIds && s.profileIds.length > 0) {
        return s.profileIds.includes(activeProfile.id);
      }
      return true;
    });

    if (activeShortcuts.length === 0) return null;

    for (const shortcut of activeShortcuts) {
      if (bufferContent.endsWith(shortcut.trigger)) {
        this.isProcessing = true;
        shortcutBuffer.clear(); // clear buffer after match to prevent re-triggering

        const requireConfirm =
          shortcut.executionMode === 'CONFIRMATION' ||
          (shortcut.executionMode === undefined &&
            (shortcut.requireConfirmation ?? true));

        this.triggerHandlers.forEach((handler) => {
          try {
            handler(shortcut, requireConfirm);
          } catch (e) {
            console.error('[ShortcutDetectionService] Error in handler:', e);
          }
        });

        setTimeout(() => {
          this.isProcessing = false;
        }, 1000);

        return shortcut;
      }
    }

    return null;
  }
}

export const shortcutDetectionService = ShortcutDetectionService.getInstance();
export default shortcutDetectionService;
