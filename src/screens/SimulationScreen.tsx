import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmergencyShortcut } from '../types/shortcuts';
import { EmergencyContact } from '../types/contacts';
import storage from '../storage';
import emergencyActionService, {
  ExecutionReport,
} from '../services/emergency/emergencyActionService';
import contactsService from '../services/contacts/contactsService';
import locationService from '../services/location/locationService';
import {
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  PhoneCall,
  MessageSquare,
  MapPin,
} from 'lucide-react-native';

export const SimulationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Simulation'>>();
  const shortcutId = route.params.shortcutId;

  const { theme, typography, borderRadius } = useTheme();

  const [shortcut, setShortcut] = useState<EmergencyShortcut | null>(null);
  const [targetContact, setTargetContact] = useState<EmergencyContact | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Not required');
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<ExecutionReport | null>(null);

  useEffect(() => {
    loadData();
  }, [shortcutId]);

  const loadData = async () => {
    const shortcuts = await storage.getShortcuts();
    const sc = shortcuts.find((s) => s.id === shortcutId) || {
      id: 'simulation_default',
      name: 'Simulated Shortcut',
      trigger: '123123123',
      actionType: 'CALL_CONTACT',
      enabled: true,
      requireConfirmation: true,
      includeLocation: true,
      message: 'EMERGENCY: I need assistance immediately.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setShortcut(sc);

    const allContacts = await contactsService.getAllContacts();
    const contact =
      (sc.contactIds && sc.contactIds.length > 0
        ? allContacts.find((c) => c.id === sc.contactIds![0])
        : allContacts.find((c) => c.isPrimary)) || allContacts[0] || null;
    setTargetContact(contact);

    if (sc.includeLocation || sc.actionType === 'SEND_LOCATION') {
      const hasPerm = await locationService.checkPermission();
      setLocationStatus(
        hasPerm
          ? 'Live GPS Location enabled'
          : 'Permission required on device'
      );
    }
  };

  const handleRunSimulation = async () => {
    if (!shortcut) return;
    setIsRunning(true);
    setReport(null);

    try {
      const result = await emergencyActionService.executeShortcut(
        shortcut,
        true // isSimulation = true
      );
      setReport(result);
    } catch (e: any) {
      console.error('Simulation error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Safe Simulation Mode"
        subtitle="Verify action parameters safely"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Safe Mode Badge Alert */}
        <Card variant="success" style={styles.banner}>
          <View style={styles.bannerRow}>
            <ShieldAlert size={22} color={theme.success} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text, fontSize: 16 }]}>
                SAFE DEMO / SIMULATION
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                No real emergency calls, SMS messages, or alarms will be dispatched.
              </Text>
            </View>
          </View>
        </Card>

        {/* Expected Action Preview */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted },
          ]}
        >
          PLANNED ACTIONS
        </Text>

        <Card style={styles.previewCard}>
          <View style={styles.previewItem}>
            <Text style={[typography.bodyMedium, { color: theme.textMuted }]}>
              Trigger Sequence:
            </Text>
            <Text
              style={[
                typography.h3,
                { color: theme.primary, fontFamily: 'monospace' },
              ]}
            >
              {shortcut?.trigger || '—'}
            </Text>
          </View>

          <View style={styles.previewItem}>
            <Text style={[typography.bodyMedium, { color: theme.textMuted }]}>
              Action Type:
            </Text>
            <Badge
              label={(shortcut?.actionType || '').replace('_', ' ')}
              variant="primary"
            />
          </View>

          <View style={styles.previewItem}>
            <Text style={[typography.bodyMedium, { color: theme.textMuted }]}>
              Would Call / Alert:
            </Text>
            <Text style={[typography.bodyLarge, { color: theme.text, fontWeight: '600' }]}>
              {targetContact
                ? `${targetContact.name} (${targetContact.phoneNumber})`
                : 'No contact selected'}
            </Text>
          </View>

          {(shortcut?.message || shortcut?.actionType === 'SEND_SMS' || shortcut?.actionType === 'EMERGENCY_MESSAGE') && (
            <View style={styles.previewItem}>
              <Text style={[typography.bodyMedium, { color: theme.textMuted }]}>
                Would Send Message:
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  { color: theme.text, marginTop: 4, fontStyle: 'italic' },
                ]}
              >
                "{shortcut?.message || 'EMERGENCY: I need assistance immediately.'}"
              </Text>
            </View>
          )}

          <View style={styles.previewItem}>
            <Text style={[typography.bodyMedium, { color: theme.textMuted }]}>
              Would Include Location:
            </Text>
            <Text style={[typography.bodyMedium, { color: theme.text }]}>
              {shortcut?.includeLocation || shortcut?.actionType === 'SEND_LOCATION'
                ? 'Current GPS Coordinates & Google Maps Link'
                : 'OFF'}
            </Text>
          </View>
        </Card>

        {/* Run Simulation Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRunSimulation}
          disabled={isRunning}
          style={[
            styles.runButton,
            {
              backgroundColor: theme.primary,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          {isRunning ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Play size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={[typography.button, { color: '#FFFFFF' }]}>
                Run Safe Simulation
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Real-time Telemetry Report */}
        {report && (
          <View style={styles.reportContainer}>
            <Text
              style={[
                typography.caption,
                styles.sectionTitle,
                { color: theme.textMuted, marginTop: 24 },
              ]}
            >
              SIMULATION TELEMETRY LOG
            </Text>

            {report.steps.map((step, idx) => {
              const isSuccess = step.status === 'SUCCESS';
              const isFailed = step.status === 'FAILED';
              return (
                <Card
                  key={idx}
                  variant={isSuccess ? 'success' : isFailed ? 'danger' : 'default'}
                  style={styles.stepCard}
                >
                  <View style={styles.stepHeader}>
                    <Text
                      style={[
                        typography.h3,
                        { color: theme.text, fontSize: 15 },
                      ]}
                    >
                      {idx + 1}. {step.step}
                    </Text>
                    <Badge
                      label={step.status}
                      variant={isSuccess ? 'success' : isFailed ? 'danger' : 'neutral'}
                    />
                  </View>
                  <Text
                    style={[
                      typography.bodySmall,
                      { color: theme.textSecondary, marginTop: 4 },
                    ]}
                  >
                    {step.message}
                  </Text>
                </Card>
              );
            })}
          </View>
        )}
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
  banner: {
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  previewCard: {
    padding: 18,
    marginBottom: 20,
  },
  previewItem: {
    marginBottom: 14,
  },
  runButton: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportContainer: {
    marginTop: 8,
  },
  stepCard: {
    marginBottom: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
