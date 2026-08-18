import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import storage from '../storage';
import {
  CalculatorPreferences,
  DEFAULT_CALCULATOR_PREFERENCES,
  APP_ICON_PRESETS,
  AppDisguisePreset,
} from '../types/calculator';
import {
  Smartphone,
  CheckCircle2,
  Sparkles,
  Edit3,
  Shield,
  Layers,
} from 'lucide-react-native';

const APP_NAME_PRESETS = [
  'Calculator',
  'Calc+',
  'Math Pro',
  'QuickCalc',
  'Simple Calculator',
  'Sentinel',
];

export const AppDisguiseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, typography, borderRadius } = useTheme();

  const [prefs, setPrefs] = useState<CalculatorPreferences>(DEFAULT_CALCULATOR_PREFERENCES);
  const [selectedName, setSelectedName] = useState('Calculator');
  const [selectedIconId, setSelectedIconId] = useState('dark_calc');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    const p = await storage.getCalculatorPreferences();
    setPrefs(p);
    setSelectedName(p.disguiseAppName || 'Calculator');
    setSelectedIconId(p.disguiseIconId || 'dark_calc');
  };

  const selectedPreset: AppDisguisePreset =
    APP_ICON_PRESETS.find((icon) => icon.id === selectedIconId) ||
    APP_ICON_PRESETS[0];

  const handleSave = async () => {
    if (!selectedName.trim()) {
      Alert.alert('Required', 'Please enter an app name.');
      return;
    }

    try {
      setLoading(true);
      await storage.saveCalculatorPreferences({
        ...prefs,
        disguiseAppName: selectedName.trim(),
        disguiseIconId: selectedIconId,
      });

      Alert.alert(
        'App Identity Updated',
        `App disguise set to "${selectedName.trim()}" with ${selectedPreset.name} icon.`
      );
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Unable to update app disguise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="App Name & Icon Disguise"
        subtitle="Customize app launcher disguise persona"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Phone Home Screen Mockup Preview */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted },
          ]}
        >
          LIVE LAUNCHER PREVIEW
        </Text>

        <Card style={styles.previewCard}>
          <View style={styles.previewContainer}>
            {/* Mock App Icon */}
            <View
              style={[
                styles.mockIcon,
                {
                  backgroundColor: selectedPreset.backgroundColor,
                  borderColor: theme.surfaceBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.mockIconInner,
                  { borderColor: 'rgba(255,255,255,0.1)' },
                ]}
              >
                <Text
                  style={[
                    styles.mockIconSymbol,
                    { color: selectedPreset.accentColor },
                  ]}
                >
                  {selectedPreset.iconSymbol}
                </Text>
              </View>
            </View>

            {/* App Label */}
            <Text
              style={[
                typography.h3,
                styles.mockLabel,
                { color: theme.text },
              ]}
              numberOfLines={1}
            >
              {selectedName.trim() || 'Calculator'}
            </Text>

            <Text
              style={[
                typography.caption,
                { color: theme.textMuted, marginTop: 4 },
              ]}
            >
              {selectedPreset.name} • {selectedPreset.category}
            </Text>
          </View>
        </Card>

        {/* App Name Customizer */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted, marginTop: 18 },
          ]}
        >
          DISGUISE APP NAME
        </Text>

        <Card style={styles.card}>
          <View style={styles.nameHeaderRow}>
            <Edit3 size={18} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[typography.h3, { color: theme.text }]}>
              Custom App Display Name
            </Text>
          </View>

          <TextInput
            value={selectedName}
            onChangeText={setSelectedName}
            placeholder="e.g. Calculator, Calc+, Math Pro"
            placeholderTextColor={theme.textMuted}
            maxLength={20}
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

          {/* Quick Presets */}
          <Text
            style={[
              typography.caption,
              { color: theme.textSecondary, marginBottom: 8, marginTop: 4 },
            ]}
          >
            QUICK PRESETS
          </Text>

          <View style={styles.presetsWrap}>
            {APP_NAME_PRESETS.map((preset) => {
              const isSelected = selectedName === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  onPress={() => setSelectedName(preset)}
                  style={[
                    styles.presetPill,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.surfaceElevated,
                      borderColor: isSelected
                        ? theme.primary
                        : theme.surfaceBorder,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.bodySmall,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textSecondary,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* App Icon Presets */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted, marginTop: 18 },
          ]}
        >
          DISGUISE APP ICON STYLES
        </Text>

        <View style={styles.iconsGrid}>
          {APP_ICON_PRESETS.map((preset) => {
            const isSelected = selectedIconId === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => setSelectedIconId(preset.id)}
                activeOpacity={0.7}
                style={[
                  styles.iconCard,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(10, 132, 255, 0.08)'
                      : theme.surface,
                    borderColor: isSelected
                      ? theme.primary
                      : theme.surfaceBorder,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                {/* Visual Icon Mock */}
                <View
                  style={[
                    styles.gridIconBox,
                    { backgroundColor: preset.backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.gridIconSymbol,
                      { color: preset.accentColor },
                    ]}
                  >
                    {preset.iconSymbol}
                  </Text>
                </View>

                <View style={styles.gridInfo}>
                  <Text
                    style={[
                      typography.h3,
                      {
                        fontSize: 14,
                        color: isSelected ? theme.primary : theme.text,
                      },
                    ]}
                  >
                    {preset.name}
                  </Text>
                  <Text
                    style={[
                      typography.bodySmall,
                      {
                        color: theme.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {preset.description}
                  </Text>
                </View>

                {isSelected && (
                  <CheckCircle2
                    size={20}
                    color={theme.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

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
            Apply App Identity
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
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  previewCard: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewContainer: {
    alignItems: 'center',
  },
  mockIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  mockIconInner: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockIconSymbol: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mockLabel: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  presetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  iconsGrid: {
    marginBottom: 12,
  },
  iconCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  gridIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gridIconSymbol: {
    fontSize: 14,
    fontWeight: '700',
  },
  gridInfo: {
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
  saveButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
});
