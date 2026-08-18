import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmergencyShortcut } from '../types/shortcuts';
import { EmergencyContact } from '../types/contacts';
import storage from '../storage';
import emergencyActionService, {
  ExecutionReport,
} from '../services/emergency/emergencyActionService';
import contactsService from '../services/contacts/contactsService';
import {
  AlertTriangle,
  ShieldCheck,
  X,
  PhoneCall,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

export const ActivationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Activation'>>();
  const { shortcutId, autoTrigger } = route.params;

  const { theme, typography, borderRadius } = useTheme();

  const [shortcut, setShortcut] = useState<EmergencyShortcut | null>(null);
  const [targetContact, setTargetContact] = useState<EmergencyContact | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [report, setReport] = useState<ExecutionReport | null>(null);

  useEffect(() => {
    loadData();
  }, [shortcutId]);

  const loadData = async () => {
    const shortcuts = await storage.getShortcuts();
    const sc = shortcuts.find((s) => s.id === shortcutId);
    if (sc) {
      setShortcut(sc);
      const allContacts = await contactsService.getAllContacts();
      const contact =
        (sc.contactIds && sc.contactIds.length > 0
          ? allContacts.find((c) => c.id === sc.contactIds![0])
          : allContacts.find((c) => c.isPrimary)) || null;
      setTargetContact(contact);

      // If confirmation is OFF and autoTrigger is true, start immediately
      if (!sc.requireConfirmation || autoTrigger) {
        startExecution(sc);
      }
    }
  };

  const startExecution = async (scToRun: EmergencyShortcut) => {
    setHasConfirmed(true);
    setIsExecuting(true);

    try {
      const result = await emergencyActionService.executeShortcut(
        scToRun,
        false // real execution
      );
      setReport(result);
    } catch (e: any) {
      console.error('Execution failure:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleConfirm = () => {
    if (shortcut) {
      startExecution(shortcut);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getActionPromptText = () => {
    if (!shortcut) return 'Execute emergency action?';
    const contactName = targetContact ? targetContact.name : 'your emergency contacts';
    const locText = shortcut.includeLocation || shortcut.actionType === 'SEND_LOCATION' ? ' and send your live location' : '';

    switch (shortcut.actionType) {
      case 'CALL_CONTACT':
        return `Call ${contactName}${locText}?`;
      case 'SEND_SMS':
      case 'EMERGENCY_MESSAGE':
        return `Send emergency alert to ${contactName}${locText}?`;
      case 'SEND_LOCATION':
        return `Send current GPS location to ${contactName}?`;
      case 'ALARM':
        return 'Sound emergency alarm?';
      default:
        return `Execute ${shortcut.name}?`;
    }
  };

  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 16
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: topInset,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <View style={styles.headerTitleRow}>
          <AlertTriangle size={22} color={theme.danger} style={{ marginRight: 8 }} />
          <Text style={[typography.h3, { color: theme.danger }]}>
            Emergency Shortcut Detected
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.closeButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {!hasConfirmed ? (
          /* Confirmation State */
          <View style={styles.confirmContainer}>
            <View
              style={[
                styles.alertBadgeCircle,
                { backgroundColor: theme.dangerSurface },
              ]}
            >
              <AlertTriangle size={48} color={theme.danger} />
            </View>

            <Text
              style={[
                typography.h2,
                { color: theme.text, textAlign: 'center', marginTop: 20 },
              ]}
            >
              {shortcut?.name}
            </Text>

            <Text
              style={[
                typography.bodyLarge,
                {
                  color: theme.textSecondary,
                  textAlign: 'center',
                  marginTop: 12,
                  lineHeight: 24,
                },
              ]}
            >
              {getActionPromptText()}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCancel}
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.surfaceBorder,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <Text style={[typography.button, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirm}
                style={[
                  styles.activateBtn,
                  {
                    backgroundColor: theme.danger,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <Text style={[typography.button, { color: '#FFFFFF' }]}>
                  ACTIVATE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Real-time Progressive Execution Status */
          <View style={styles.executionContainer}>
            <View style={styles.statusHeaderRow}>
              {isExecuting ? (
                <ActivityIndicator size="small" color={theme.primary} style={{ marginRight: 8 }} />
              ) : report?.overallStatus === 'SUCCESS' ? (
                <CheckCircle2 size={22} color={theme.success} style={{ marginRight: 8 }} />
              ) : (
                <XCircle size={22} color={theme.danger} style={{ marginRight: 8 }} />
              )}
              <Text style={[typography.h2, { color: theme.text }]}>
                {isExecuting
                  ? `Executing ${shortcut?.name}...`
                  : report?.overallStatus === 'SUCCESS'
                  ? 'Emergency Action Launched'
                  : 'Action Completed with Notes'}
              </Text>
            </View>

            <Text
              style={[
                typography.caption,
                styles.telemetryLabel,
                { color: theme.textMuted },
              ]}
            >
              LIVE EXECUTION TELEMETRY
            </Text>

            {report?.steps.map((step, idx) => {
              const isSuccess = step.status === 'SUCCESS';
              const isLaunched = step.status === 'ACTION_LAUNCHED';
              const isFailed = step.status === 'FAILED';

              return (
                <Card
                  key={idx}
                  variant={isSuccess ? 'success' : isFailed ? 'danger' : 'default'}
                  style={styles.stepCard}
                >
                  <View style={styles.stepHeader}>
                    <Text style={[typography.h3, { color: theme.text, fontSize: 15 }]}>
                      {isSuccess ? '✓ ' : isLaunched ? '↗ ' : '✗ '}
                      {step.step}
                    </Text>
                    <Badge
                      label={step.status.replace('_', ' ')}
                      variant={isSuccess ? 'success' : isLaunched ? 'primary' : isFailed ? 'danger' : 'neutral'}
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

            {!isExecuting && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
                style={[
                  styles.dismissBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.surfaceBorder,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <Text style={[typography.button, { color: theme.text }]}>
                  Return to Calculator
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  confirmContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  alertBadgeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 40,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activateBtn: {
    flex: 1.2,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  executionContainer: {
    paddingTop: 12,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  telemetryLabel: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  stepCard: {
    marginBottom: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dismissBtn: {
    height: 52,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
});
