import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { ActionType, ExecutionMode, EmergencyShortcut } from '../types/shortcuts';
import { EmergencyContact } from '../types/contacts';
import { EmergencyProfile } from '../types/profiles';
import shortcutDetectionService from '../services/shortcuts/shortcutDetectionService';
import contactsService from '../services/contacts/contactsService';
import storage from '../storage';
import {
  PhoneCall,
  MessageSquare,
  MapPin,
  AlertTriangle,
  Bell,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ACTION_OPTIONS: {
  type: ActionType;
  label: string;
  desc: string;
  icon: any;
}[] = [
  {
    type: 'CALL_CONTACT',
    label: 'Call Contact',
    desc: 'Automatically dials designated emergency contact',
    icon: PhoneCall,
  },
  {
    type: 'SEND_SMS',
    label: 'Send Emergency SMS',
    desc: 'Prepares & dispatches SMS alert to selected contact(s)',
    icon: MessageSquare,
  },
  {
    type: 'SEND_LOCATION',
    label: 'Send Live Location',
    desc: 'Shares live GPS coordinates and Google Maps link',
    icon: MapPin,
  },
  {
    type: 'COMPOSITE_SOS',
    label: 'Full Panic Composite SOS',
    desc: 'Broadcasts SMS to all contacts + Dials primary + Shares GPS',
    icon: AlertTriangle,
  },
  {
    type: 'ALARM',
    label: 'Alarm Siren',
    desc: 'Sounds loud emergency siren pattern',
    icon: Bell,
  },
];

const EXECUTION_MODES: {
  mode: ExecutionMode;
  label: string;
  desc: string;
}[] = [
  {
    mode: 'CONFIRMATION',
    label: 'Confirmation Dialog',
    desc: 'Asks "Call / Alert?" before firing',
  },
  {
    mode: 'INSTANT',
    label: 'Instant Execution',
    desc: 'Executes immediately upon typing code',
  },
  {
    mode: 'COUNTDOWN',
    label: '5s Countdown Timer',
    desc: '5-second window with cancel button',
  },
  {
    mode: 'STEALTH',
    label: 'Stealth Camouflage',
    desc: 'Runs silently while showing fake math result',
  },
];

export const CreateShortcutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateShortcut'>>();
  const shortcutId = route.params?.shortcutId;

  const { theme, typography, borderRadius } = useTheme();

  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [selectedActions, setSelectedActions] = useState<ActionType[]>(['CALL_CONTACT']);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('CONFIRMATION');
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [allContacts, setAllContacts] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [message, setMessage] = useState('EMERGENCY: I need assistance immediately. My location: {location}');
  const [includeLocation, setIncludeLocation] = useState(true);
  const [fakeDisplayResult, setFakeDisplayResult] = useState('0');
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [profiles, setProfiles] = useState<EmergencyProfile[]>([]);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (shortcutId) {
      loadExistingShortcut();
    }
  }, [shortcutId]);

  const loadData = async () => {
    const contactList = await contactsService.getAllContacts();
    setContacts(contactList);
    if (contactList.length > 0 && selectedContactIds.length === 0) {
      const primary = contactList.find((c) => c.isPrimary) || contactList[0];
      setSelectedContactIds([primary.id]);
    }

    const profileList = await storage.getProfiles();
    setProfiles(profileList);
  };

  const loadExistingShortcut = async () => {
    if (!shortcutId) return;
    const shortcuts = await storage.getShortcuts();
    const sc = shortcuts.find((s) => s.id === shortcutId);
    if (sc) {
      setName(sc.name);
      setTrigger(sc.trigger);
      setSelectedActions(
        sc.actionTypes && sc.actionTypes.length > 0
          ? sc.actionTypes
          : [sc.actionType]
      );
      setExecutionMode(sc.executionMode || (sc.requireConfirmation ? 'CONFIRMATION' : 'INSTANT'));
      setCountdownSeconds(sc.countdownSeconds || 5);
      setAllContacts(sc.allContacts ?? false);
      setSelectedContactIds(sc.contactIds || []);
      setMessage(sc.message || 'EMERGENCY: I need assistance. My location: {location}');
      setIncludeLocation(sc.includeLocation ?? true);
      setFakeDisplayResult(sc.fakeDisplayResult || '0');
      setSelectedProfileIds(sc.profileIds || []);
      setEnabled(sc.enabled);
    }
  };

  const handleTriggerChange = async (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setTrigger(cleaned);

    if (cleaned.length >= 2) {
      const val = await shortcutDetectionService.validateTrigger(
        cleaned,
        shortcutId
      );
      if (!val.isValid) {
        setTriggerError(val.errorMessage || 'Invalid trigger');
      } else {
        setTriggerError(null);
      }
    } else if (cleaned.length > 0) {
      setTriggerError('Trigger must be at least 2 digits long');
    } else {
      setTriggerError(null);
    }
  };

  const toggleAction = (type: ActionType) => {
    if (selectedActions.includes(type)) {
      if (selectedActions.length > 1) {
        setSelectedActions(selectedActions.filter((a) => a !== type));
      }
    } else {
      setSelectedActions([...selectedActions, type]);
    }
  };

  const toggleContact = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter((id) => id !== contactId));
    } else {
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };

  const appendTag = (tag: string) => {
    setMessage((prev) => `${prev} ${tag}`);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please give this shortcut a name.');
      return;
    }
    if (!trigger.trim() || trigger.length < 2) {
      Alert.alert('Required', 'Please enter a trigger sequence of at least 2 digits.');
      return;
    }

    const primaryAction = selectedActions[0] || 'CALL_CONTACT';

    let finalContactIds = selectedContactIds;
    if (!allContacts && finalContactIds.length === 0 && contacts.length > 0) {
      finalContactIds = [contacts[0].id];
    }

    try {
      setLoading(true);
      await shortcutDetectionService.saveShortcut({
        id: shortcutId,
        name: name.trim(),
        trigger: trigger.trim(),
        actionType: primaryAction,
        actionTypes: selectedActions,
        executionMode,
        countdownSeconds,
        allContacts,
        contactIds: allContacts ? [] : finalContactIds,
        message: message.trim(),
        includeLocation,
        requireConfirmation: executionMode === 'CONFIRMATION',
        fakeDisplayResult: fakeDisplayResult.trim() || '0',
        profileIds: selectedProfileIds,
        enabled,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Unable to save shortcut.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!shortcutId) return;
    Alert.alert(
      'Delete Shortcut',
      `Delete "${name}" trigger permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await shortcutDetectionService.deleteShortcut(shortcutId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleTestSimulation = () => {
    if (!trigger.trim()) {
      Alert.alert('Simulation', 'Please enter a trigger sequence first.');
      return;
    }
    navigation.navigate('Simulation', {
      shortcutId: shortcutId || 'temp_simulation',
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={shortcutId ? 'Edit Shortcut' : 'Create Custom Shortcut'}
        subtitle="Universal flexible emergency trigger"
        onBack={() => navigation.goBack()}
        rightAction={
          shortcutId ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Trash2 size={20} color={theme.danger} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Field */}
        <Text style={[typography.caption, styles.label, { color: theme.textMuted }]}>
          SHORTCUT NAME
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Call Mom & Send GPS, Panic SOS"
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              color: theme.text,
              borderRadius: borderRadius.md,
            },
          ]}
        />

        {/* Trigger Field */}
        <Text style={[typography.caption, styles.label, { color: theme.textMuted }]}>
          CALCULATOR TRIGGER (ANY DIGITS)
        </Text>
        <TextInput
          value={trigger}
          onChangeText={handleTriggerChange}
          placeholder="e.g. 123123123, 7777, 911911"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: triggerError
                ? theme.danger
                : trigger.length >= 2
                ? theme.success
                : theme.surfaceBorder,
              color: theme.text,
              borderRadius: borderRadius.md,
              fontFamily: 'monospace',
              fontSize: 18,
            },
          ]}
        />
        {triggerError ? (
          <View style={styles.validationRow}>
            <AlertCircle size={14} color={theme.danger} style={{ marginRight: 6 }} />
            <Text style={[typography.bodySmall, { color: theme.danger }]}>
              {triggerError}
            </Text>
          </View>
        ) : trigger.length >= 2 ? (
          <View style={styles.validationRow}>
            <CheckCircle2 size={14} color={theme.success} style={{ marginRight: 6 }} />
            <Text style={[typography.bodySmall, { color: theme.success }]}>
              Valid unique trigger sequence
            </Text>
          </View>
        ) : null}

        {/* Actions Selection (Multi-select support) */}
        <Text
          style={[
            typography.caption,
            styles.label,
            { color: theme.textMuted, marginTop: 14 },
          ]}
        >
          ACTIONS TO TRIGGER (MULTI-SELECT ENABLED)
        </Text>

        {ACTION_OPTIONS.map((opt) => {
          const isSelected = selectedActions.includes(opt.type);
          const IconComponent = opt.icon;
          return (
            <Card
              key={opt.type}
              onPress={() => toggleAction(opt.type)}
              style={[
                styles.actionCard,
                isSelected && {
                  borderColor: theme.primary,
                  backgroundColor: 'rgba(10, 132, 255, 0.08)',
                },
              ]}
            >
              <View style={styles.actionRow}>
                <View
                  style={[
                    styles.actionIconCircle,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.surfaceElevated,
                    },
                  ]}
                >
                  <IconComponent
                    size={18}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      typography.h3,
                      {
                        color: isSelected ? theme.primary : theme.text,
                        fontSize: 15,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      typography.bodySmall,
                      { color: theme.textSecondary, marginTop: 2 },
                    ]}
                  >
                    {opt.desc}
                  </Text>
                </View>
                {isSelected && (
                  <CheckCircle2 size={20} color={theme.primary} />
                )}
              </View>
            </Card>
          );
        })}

        {/* Execution Mode Selection */}
        <Text
          style={[
            typography.caption,
            styles.label,
            { color: theme.textMuted, marginTop: 16 },
          ]}
        >
          EXECUTION BEHAVIOR
        </Text>

        {EXECUTION_MODES.map((modeOpt) => {
          const isSelected = executionMode === modeOpt.mode;
          return (
            <Card
              key={modeOpt.mode}
              onPress={() => setExecutionMode(modeOpt.mode)}
              style={[
                styles.actionCard,
                isSelected && {
                  borderColor: theme.warning,
                  backgroundColor: 'rgba(255, 159, 10, 0.08)',
                },
              ]}
            >
              <View style={styles.modeRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      typography.h3,
                      {
                        color: isSelected ? theme.warning : theme.text,
                        fontSize: 15,
                      },
                    ]}
                  >
                    {modeOpt.label}
                  </Text>
                  <Text
                    style={[
                      typography.bodySmall,
                      { color: theme.textSecondary, marginTop: 2 },
                    ]}
                  >
                    {modeOpt.desc}
                  </Text>
                </View>
                {isSelected && (
                  <CheckCircle2 size={20} color={theme.warning} />
                )}
              </View>
            </Card>
          );
        })}

        {/* Fake Calculator Math Result (if Stealth mode) */}
        {executionMode === 'STEALTH' && (
          <Card variant="warning" style={{ marginVertical: 12 }}>
            <Text style={[typography.h3, { color: theme.text, fontSize: 15 }]}>
              Fake Math Result on Calculator Display
            </Text>
            <Text
              style={[
                typography.bodySmall,
                { color: theme.textSecondary, marginTop: 2, marginBottom: 8 },
              ]}
            >
              When this shortcut triggers, replace the display with this value so the
              screen appears completely normal:
            </Text>
            <TextInput
              value={fakeDisplayResult}
              onChangeText={setFakeDisplayResult}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.surfaceBorder,
                  color: theme.text,
                  borderRadius: borderRadius.md,
                },
              ]}
            />
          </Card>
        )}

        {/* Recipients / Contacts Selection */}
        <View style={styles.recipientsHeader}>
          <Text
            style={[
              typography.caption,
              styles.label,
              { color: theme.textMuted, marginTop: 14, flex: 1 },
            ]}
          >
            TARGET RECIPIENTS
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateContact', undefined)}
            style={styles.addContactLink}
          >
            <Plus size={14} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[typography.caption, { color: theme.primary, fontWeight: '700' }]}>
              Add Contact
            </Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.h3, { color: theme.text, fontSize: 15 }]}>
                Broadcast to All Contacts
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Send emergency message to all saved contacts
              </Text>
            </View>
            <Switch
              value={allContacts}
              onValueChange={setAllContacts}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>
        </Card>

        {!allContacts && (
          <View style={styles.contactsList}>
            {contacts.length === 0 ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateContact', undefined)}
                style={[
                  styles.emptyContactBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.surfaceBorder,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Users size={20} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={[typography.bodyMedium, { color: theme.primary }]}>
                  No contacts found. Tap to add an emergency contact.
                </Text>
              </TouchableOpacity>
            ) : (
              contacts.map((c) => {
                const isSelected = selectedContactIds.includes(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => toggleContact(c.id)}
                    style={[
                      styles.contactChip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surface,
                        borderColor: isSelected
                          ? theme.primary
                          : theme.surfaceBorder,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.h3,
                        {
                          fontSize: 14,
                          color: isSelected ? '#FFFFFF' : theme.text,
                        },
                      ]}
                    >
                      {c.name} ({c.relationship})
                    </Text>
                    <Text
                      style={[
                        typography.bodySmall,
                        {
                          color: isSelected
                            ? 'rgba(255,255,255,0.8)'
                            : theme.textSecondary,
                          fontSize: 12,
                        },
                      ]}
                    >
                      {c.phoneNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Custom Message Editor & Dynamic Tag Inserters */}
        <Text
          style={[
            typography.caption,
            styles.label,
            { color: theme.textMuted, marginTop: 14 },
          ]}
        >
          CUSTOM EMERGENCY MESSAGE TEMPLATE
        </Text>

        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              color: theme.text,
              borderRadius: borderRadius.md,
            },
          ]}
        />

        <View style={styles.tagsRow}>
          <TouchableOpacity
            onPress={() => appendTag('{location}')}
            style={[
              styles.tagBtn,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder },
            ]}
          >
            <Text style={[typography.caption, { color: theme.primary }]}>
              + {`{location}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => appendTag('{time}')}
            style={[
              styles.tagBtn,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder },
            ]}
          >
            <Text style={[typography.caption, { color: theme.primary }]}>
              + {`{time}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => appendTag('{name}')}
            style={[
              styles.tagBtn,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder },
            ]}
          >
            <Text style={[typography.caption, { color: theme.primary }]}>
              + {`{name}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Toggle */}
        <Card style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.h3, { color: theme.text, fontSize: 15 }]}>
                Include Live GPS Coordinates
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Attach Google Maps link with exact latitude/longitude
              </Text>
            </View>
            <Switch
              value={includeLocation}
              onValueChange={setIncludeLocation}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>
        </Card>

        {/* Test / Safe Simulation Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleTestSimulation}
          style={[
            styles.simulationButton,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.surfaceBorder,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          <Play size={18} color={theme.primary} style={{ marginRight: 8 }} />
          <Text style={[typography.button, { color: theme.primary }]}>
            Test in Safe Simulation Mode
          </Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={loading}
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.primary,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          <Text style={[typography.button, { color: '#FFFFFF' }]}>
            {shortcutId ? 'Update Shortcut' : 'Save Emergency Shortcut'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  actionCard: {
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recipientsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addContactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginTop: 10,
  },
  switchCard: {
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactsList: {
    marginBottom: 10,
  },
  contactChip: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  emptyContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  simulationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  saveButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 4,
  },
});
