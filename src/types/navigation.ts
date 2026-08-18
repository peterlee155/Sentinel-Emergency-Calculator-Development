export type RootStackParamList = {
  Calculator: undefined;
  ShortcutsList: undefined;
  CreateShortcut: { shortcutId?: string } | undefined;
  ContactsList: undefined;
  CreateContact: { contactId?: string } | undefined;
  Settings: undefined;
  Profiles: undefined;
  CreateProfile: { profileId?: string } | undefined;
  Security: undefined;
  CamouflageSettings: undefined;
  AppDisguise: undefined;
  Subscription: undefined;
  Simulation: { shortcutId: string };
  Activation: { shortcutId: string; autoTrigger?: boolean };
};
