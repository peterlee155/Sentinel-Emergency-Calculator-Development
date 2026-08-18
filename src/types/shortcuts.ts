export type ActionType =
  | 'CALL_CONTACT'
  | 'SEND_SMS'
  | 'SEND_LOCATION'
  | 'EMERGENCY_MESSAGE'
  | 'ALARM'
  | 'COMPOSITE_SOS';

export type ExecutionMode =
  | 'CONFIRMATION' // Shows prompt: [Cancel] [ACTIVATE]
  | 'INSTANT'      // Launches action immediately
  | 'COUNTDOWN'    // 3s / 5s / 10s countdown with cancel window
  | 'STEALTH';     // Silent background execution + fake calculator result

export interface EmergencyShortcut {
  id: string;
  name: string;
  trigger: string; // e.g. "123123123" or custom digits
  enabled: boolean;
  actionType: ActionType;
  actionTypes?: ActionType[]; // Support for multiple chained actions (e.g. SMS + Call + Location)
  executionMode?: ExecutionMode;
  countdownSeconds?: number; // e.g. 3, 5, 10
  contactIds?: string[];
  allContacts?: boolean; // Send to all emergency contacts simultaneously
  message?: string;
  includeLocation?: boolean;
  requireConfirmation?: boolean;
  fakeDisplayResult?: string; // e.g. "0" or "42" to show on calculator screen
  alarmOptions?: {
    siren?: boolean;
    vibration?: boolean;
    strobe?: boolean;
  };
  profileIds?: string[]; // Specific profiles this shortcut is active in (empty = all)
  createdAt: number;
  updatedAt: number;
}

export type TriggerValidationResult = {
  isValid: boolean;
  errorMessage?: string;
  conflictShortcutId?: string;
};
