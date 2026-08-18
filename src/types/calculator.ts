export type Operator = '+' | '−' | '×' | '÷';

export type KeyType =
  | 'digit'
  | 'operator'
  | 'equals'
  | 'clear'
  | 'allClear'
  | 'backspace'
  | 'negate'
  | 'percent'
  | 'decimal';

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  displayValue: string;
  previousValue: string | null;
  operator: Operator | null;
  waitingForOperand: boolean;
  clearLabel: 'AC' | 'C';
  expression: string;
}

export interface CalculatorPreferences {
  // Disguise & Camouflage
  hideSentinelBadge: boolean;      // Hides top "SENTINEL" badge for true disguise
  secretUnlockCode: string;        // e.g. "0000=" or "7788=" typed in calculator to open settings
  longPressEqualsUnlock: boolean;  // Long-pressing '=' button unlocks Settings
  longPressACUnlock: boolean;      // Long-pressing 'AC' button unlocks Settings
  
  // Haptics & Feedback
  hapticFeedback: 'off' | 'light' | 'medium' | 'heavy';
  keySounds: boolean;
  
  // Math & Display
  decimalPrecision: 'auto' | '2' | '4' | '6' | 'full';
  keepHistory: boolean;
  maxHistoryItems: number;
}

export const DEFAULT_CALCULATOR_PREFERENCES: CalculatorPreferences = {
  hideSentinelBadge: false,
  secretUnlockCode: '0000=',
  longPressEqualsUnlock: true,
  longPressACUnlock: false,
  hapticFeedback: 'light',
  keySounds: false,
  decimalPrecision: 'auto',
  keepHistory: true,
  maxHistoryItems: 50,
};
