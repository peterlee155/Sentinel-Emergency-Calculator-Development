export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceBorder: string;
  
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Calculator Keys
  keyDigitBg: string;
  keyDigitBgActive: string;
  keyDigitText: string;
  
  keyFnBg: string;
  keyFnBgActive: string;
  keyFnText: string;
  
  keyOpBg: string;
  keyOpBgActive: string;
  keyOpActiveBg: string;
  keyOpText: string;
  keyOpActiveText: string;
  
  keyActionBg: string;
  keyActionBgActive: string;
  
  // Emergency / Sentinel Branding & Statuses
  primary: string;
  danger: string;
  dangerSurface: string;
  warning: string;
  warningSurface: string;
  success: string;
  successSurface: string;
  
  divider: string;
  shadow: string;
  statusBar: 'light-content' | 'dark-content' | 'default';
}

export const darkTheme: ThemeColors = {
  background: '#090B0E',
  backgroundSecondary: '#141820',
  surface: '#1B212D',
  surfaceElevated: '#242C3C',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  
  text: '#FFFFFF',
  textSecondary: '#8E99A8',
  textMuted: '#586274',
  
  // Calculator Keys
  keyDigitBg: '#1B212D',
  keyDigitBgActive: '#2C3547',
  keyDigitText: '#FFFFFF',
  
  keyFnBg: '#2A3344',
  keyFnBgActive: '#3B475D',
  keyFnText: '#D1D7E0',
  
  keyOpBg: '#FF9F0A',
  keyOpBgActive: '#E08B00',
  keyOpActiveBg: '#FFFFFF',
  keyOpText: '#FFFFFF',
  keyOpActiveText: '#FF9F0A',
  
  keyActionBg: '#0A84FF',
  keyActionBgActive: '#0070DF',
  
  // Emergency / Sentinel Branding & Statuses
  primary: '#0A84FF',
  danger: '#FF453A',
  dangerSurface: 'rgba(255, 69, 58, 0.15)',
  warning: '#FFD60A',
  warningSurface: 'rgba(255, 214, 10, 0.15)',
  success: '#30D158',
  successSurface: 'rgba(48, 209, 88, 0.15)',
  
  divider: 'rgba(255, 255, 255, 0.08)',
  shadow: '#000000',
  statusBar: 'light-content',
};

export const lightTheme: ThemeColors = {
  background: '#F6F8FA',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F3F6',
  surfaceBorder: 'rgba(0, 0, 0, 0.08)',
  
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  
  // Calculator Keys
  keyDigitBg: '#FFFFFF',
  keyDigitBgActive: '#E5E7EB',
  keyDigitText: '#111827',
  
  keyFnBg: '#E5E7EB',
  keyFnBgActive: '#D1D5DB',
  keyFnText: '#1F2937',
  
  keyOpBg: '#FF9F0A',
  keyOpBgActive: '#E08B00',
  keyOpActiveBg: '#111827',
  keyOpText: '#FFFFFF',
  keyOpActiveText: '#FF9F0A',
  
  keyActionBg: '#0066CC',
  keyActionBgActive: '#0052A3',
  
  // Emergency / Sentinel Branding & Statuses
  primary: '#0066CC',
  danger: '#D70015',
  dangerSurface: 'rgba(215, 0, 21, 0.1)',
  warning: '#B25000',
  warningSurface: 'rgba(178, 80, 0, 0.1)',
  success: '#248A3D',
  successSurface: 'rgba(36, 138, 61, 0.1)',
  
  divider: 'rgba(0, 0, 0, 0.06)',
  shadow: '#000000',
  statusBar: 'dark-content',
};
