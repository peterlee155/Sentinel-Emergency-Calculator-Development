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

export interface AppDisguisePreset {
  id: string;
  name: string;
  category: string;
  iconSymbol: string;
  backgroundColor: string;
  accentColor: string;
  description: string;
}

export const APP_ICON_PRESETS: AppDisguisePreset[] = [
  {
    id: 'dark_calc',
    name: 'OLED Calculator',
    category: 'Minimal',
    iconSymbol: '± ÷ =',
    backgroundColor: '#16191E',
    accentColor: '#FF9500',
    description: 'Sleek dark calculator icon with orange accents',
  },
  {
    id: 'ios_classic',
    name: 'Classic iOS',
    category: 'Native',
    iconSymbol: '+ − ×',
    backgroundColor: '#2C2C2E',
    accentColor: '#30D158',
    description: 'Traditional iOS style calculator with vibrant accents',
  },
  {
    id: 'minimal_white',
    name: 'Monochrome Light',
    category: 'Minimal',
    iconSymbol: '1 2 3',
    backgroundColor: '#F2F2F7',
    accentColor: '#000000',
    description: 'Clean high-contrast monochrome design',
  },
  {
    id: 'retro_lcd',
    name: 'Retro LCD',
    category: 'Retro',
    iconSymbol: '8 8 8',
    backgroundColor: '#1E2D24',
    accentColor: '#30D158',
    description: 'Vintage 1980s green-tinted LCD calculator',
  },
  {
    id: 'scientific',
    name: 'Scientific Math',
    category: 'Technical',
    iconSymbol: 'π √x ∫',
    backgroundColor: '#0F172A',
    accentColor: '#0A84FF',
    description: 'Advanced mathematics and scientific tool icon',
  },
  {
    id: 'sentinel_shield',
    name: 'Sentinel Pro',
    category: 'Official',
    iconSymbol: '🛡️',
    backgroundColor: '#0A84FF',
    accentColor: '#FFFFFF',
    description: 'Original Sentinel safety shield identity',
  },
];

export interface CalculatorPreferences {
  // App Disguise & Custom Name/Icon
  disguiseAppName: string;          // e.g. "Calculator", "Calc+", "Math Pro", or custom
  disguiseIconId: string;           // Selected icon preset id

  // Camouflage & Gestures
  hideSentinelBadge: boolean;      // Hides top badge for true disguise
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
  disguiseAppName: 'Calculator',
  disguiseIconId: 'dark_calc',
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
