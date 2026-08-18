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
import storage from '../storage';
import { CalculatorPreferences } from '../types/calculator';
import { EyeOff, Key, Sparkles, Sliders, Smartphone, Check, ChevronRight } from 'lucide-react-native';

export const CamouflageSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, typography, borderRadius } = useTheme();

  const [prefs, setPrefs] = useState<CalculatorPreferences | null>(null);
  const [hideBadge, setHideBadge] = useState(false);
  const [unlockCode, setUnlockCode] = useState('0000=');
  const [longPressEquals, setLongPressEquals] = useState(true);
  const [longPressAC, setLongPressAC] = useState(false);
  const [hapticStyle, setHapticStyle] = useState<'off' | 'light' | 'medium' | 'heavy'>('light');
  const [decimalPrecision, setDecimalPrecision] = useState<'auto' | '2' | '4' | '6' | 'full'>('auto');

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    const p = await storage.getCalculatorPreferences();
    setPrefs(p);
    setHideBadge(p.hideSentinelBadge);
    setUnlockCode(p.secretUnlockCode || '0000=');
    setLongPressEquals(p.longPressEqualsUnlock);
    setLongPressAC(p.longPressACUnlock);
    setHapticStyle(p.hapticFeedback);
    setDecimalPrecision(p.decimalPrecision);
  };

  const handleSave = async () => {
    if (!prefs) return;
    await storage.saveCalculatorPreferences({
      ...prefs,
      hideSentinelBadge: hideBadge,
      secretUnlockCode: unlockCode.trim() || '0000=',
      longPressEqualsUnlock: longPressEquals,
      longPressACUnlock: longPressAC,
      hapticFeedback: hapticStyle,
      decimalPrecision: decimalPrecision,
    });

    Alert.alert(
      'Preferences Saved',
      hideBadge
        ? `Camouflage Mode Active! The top badge is hidden. Type "${unlockCode}" or long-press '=' to open settings.`
        : 'Calculator preferences updated successfully.'
    );
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Camouflage & Gestures"
        subtitle="Disguise and stealth access controls"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* App Name & Launcher Icon Link */}
        <Card
          onPress={() => navigation.navigate('AppDisguise')}
          style={styles.card}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
              ]}
            >
              <Smartphone size={22} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                App Name & Launcher Icon
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Customize app display name and disguise icon style
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </View>
        </Card>

        {/* Camouflage Mode Toggle */}
        <Card variant={hideBadge ? 'warning' : 'default'} style={styles.card}>
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: hideBadge ? theme.warningSurface : theme.surfaceElevated },
              ]}
            >
              <EyeOff size={22} color={hideBadge ? theme.warning : theme.text} />
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Hide Top Header Badge
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Disguises calculator by removing any visible safety branding
              </Text>
            </View>
            <Switch
              value={hideBadge}
              onValueChange={setHideBadge}
              trackColor={{ false: '#767577', true: theme.warning }}
            />
          </View>
        </Card>

        {/* Secret Unlock Calculation Code */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted, marginTop: 14 },
          ]}
        >
          SECRET CALCULATOR UNLOCK CODE
        </Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
              ]}
            >
              <Key size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Unlock Calculation Code
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Typing this sequence on the calculator opens Settings
              </Text>
            </View>
          </View>

          <TextInput
            value={unlockCode}
            onChangeText={setUnlockCode}
            placeholder="0000="
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

        {/* Secret Gestures */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted, marginTop: 14 },
          ]}
        >
          SECRET UNLOCK GESTURES
        </Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Long-Press '=' Key (1.5s)
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Hold the equals button on keypad to open Safety Hub
              </Text>
            </View>
            <Switch
              value={longPressEquals}
              onValueChange={setLongPressEquals}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Long-Press 'AC' Key (1.5s)
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Hold the clear button on keypad to open Safety Hub
              </Text>
            </View>
            <Switch
              value={longPressAC}
              onValueChange={setLongPressAC}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>
        </Card>

        {/* Haptics & Feedback */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted, marginTop: 14 },
          ]}
        >
          KEYPAD HAPTIC FEEDBACK
        </Text>

        <View style={styles.pillsRow}>
          {(['off', 'light', 'medium', 'heavy'] as const).map((styleOpt) => {
            const isSelected = hapticStyle === styleOpt;
            return (
              <TouchableOpacity
                key={styleOpt}
                onPress={() => setHapticStyle(styleOpt)}
                style={[
                  styles.pill,
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
                    typography.caption,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '400',
                    },
                  ]}
                >
                  {styleOpt.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.primary,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          <Text style={[typography.button, { color: '#FFFFFF' }]}>
            Save Preferences
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
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 18,
    fontFamily: 'monospace',
    marginTop: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginHorizontal: 3,
  },
  saveButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
