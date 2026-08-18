export type BuiltinProfileType = 'Home' | 'Travel' | 'Night' | 'Work' | 'Custom';

export interface EmergencyProfile {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  shortcutIds: string[];
  isCustom?: boolean;
  color?: string; // hex color tag e.g. '#0A84FF', '#FF9F0A', '#30D158', '#AF52DE'
  icon?: string;  // icon key e.g. 'home', 'travel', 'night', 'work', 'shield', 'heart', 'lock'
  autoActivateTime?: {
    startTime: string; // HH:mm format e.g. "22:00"
    endTime: string;   // HH:mm format e.g. "06:00"
  };
  createdAt?: number;
}
