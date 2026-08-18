export type RelationshipType =
  | 'Family'
  | 'Parent'
  | 'Partner'
  | 'Child'
  | 'Friend'
  | 'Colleague'
  | 'Doctor'
  | 'Other';

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: RelationshipType | string;
  isPrimary?: boolean;
  notes?: string;
  createdAt: number;
}
