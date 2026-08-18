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
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import securityService from '../services/security/securityService';
import storage from '../storage';
import { Lock, Fingerprint, KeyRound, ShieldAlert } from 'lucide-react-native';

export const SecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, typography, borderRadius } = useTheme();

  const [hasPin, setHasPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isHardwareSupported, setIsHardwareSupported] = useState(false);

  useEffect(() => {
    loadSecurityStatus();
  }, []);

  const loadSecurityStatus = async () => {
    const pinExists = await securityService.hasPin();
    setHasPin(pinExists);

    const bioEnabled = await storage.isBiometricsEnabled();
    setBiometricsEnabled(bioEnabled);

    const hwSupported = await securityService.isBiometricHardwareAvailable();
    setIsHardwareSupported(hwSupported);
  };

  const handleSavePin = async () => {
    if (!newPin || newPin.length < 4) {
      Alert.alert('Invalid PIN', 'Master PIN must be at least 4 digits long.');
      return;
    }
    await securityService.setPin(newPin);
    setHasPin(true);
    setNewPin('');
    Alert.alert('Security', 'Master PIN set successfully. Emergency configuration is now locked.');
  };

  const handleRemovePin = async () => {
    Alert.alert(
      'Remove PIN',
      'Disable PIN protection for Sentinel settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await securityService.removePin();
            setHasPin(false);
          },
        },
      ]
    );
  };

  const handleToggleBiometrics = async (val: boolean) => {
    if (val) {
      const auth = await securityService.authenticateBiometrics(
        'Confirm biometrics to enable hardware lock'
      );
      if (auth) {
        await storage.setBiometricsEnabled(true);
        setBiometricsEnabled(true);
      } else {
        Alert.alert('Failed', 'Biometric authentication was cancelled.');
      }
    } else {
      await storage.setBiometricsEnabled(false);
      setBiometricsEnabled(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Security & Lock"
        subtitle="Protect emergency configuration"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="default" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Lock size={20} color={theme.primary} style={{ marginRight: 10 }} />
            <Text
              style={[
                typography.bodySmall,
                { color: theme.textSecondary, flex: 1 },
              ]}
            >
              When security protection is enabled, opening the Sentinel safety hub
              from the calculator requires biometric authentication or your Master PIN.
            </Text>
          </View>
        </Card>

        {/* Biometric Toggle */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
              ]}
            >
              <Fingerprint size={22} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Biometric Protection
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                {isHardwareSupported
                  ? 'Face ID / Fingerprint unlock'
                  : 'Hardware unavailable on this device'}
              </Text>
            </View>
            <Switch
              disabled={!isHardwareSupported}
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>
        </Card>

        {/* Master PIN */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted, marginTop: 20 },
          ]}
        >
          MASTER SECURITY PIN
        </Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.surfaceElevated },
              ]}
            >
              <KeyRound size={20} color={theme.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                {hasPin ? 'PIN Lock Active' : 'No PIN Set'}
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                {hasPin
                  ? 'Master PIN is configured'
                  : 'Set a numeric PIN to protect settings'}
              </Text>
            </View>
          </View>

          {hasPin ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleRemovePin}
              style={[
                styles.removePinBtn,
                {
                  borderColor: theme.danger,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={[typography.button, { color: theme.danger, fontSize: 14 }]}>
                Remove Security PIN
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.setPinContainer}>
              <TextInput
                value={newPin}
                onChangeText={setNewPin}
                placeholder="Enter 4-6 digit PIN"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={8}
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.surfaceBorder,
                    color: theme.text,
                    borderRadius: borderRadius.md,
                  },
                ]}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSavePin}
                style={[
                  styles.savePinBtn,
                  {
                    backgroundColor: theme.primary,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text style={[typography.button, { color: '#FFFFFF', fontSize: 14 }]}>
                  Set PIN
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
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
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  removePinBtn: {
    borderWidth: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  setPinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  pinInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    marginRight: 10,
  },
  savePinBtn: {
    height: 46,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
