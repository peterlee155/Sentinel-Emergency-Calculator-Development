import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import storage from '../storage';
import {
  Users,
  Zap,
  Sliders,
  Lock,
  EyeOff,
  Crown,
  Moon,
  Sun,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Smartphone,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { theme, typography, isDark, toggleTheme } = useTheme();

  const [activeProfileName, setActiveProfileName] = useState('Home');
  const [contactsCount, setContactsCount] = useState(0);
  const [shortcutsCount, setShortcutsCount] = useState(0);
  const [isSecured, setIsSecured] = useState(false);
  const [isCamouflaged, setIsCamouflaged] = useState(false);
  const [disguiseName, setDisguiseName] = useState('Calculator');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadStats();
    }
  }, [isFocused]);

  const loadStats = async () => {
    const contacts = await storage.getContacts();
    setContactsCount(contacts.length);

    const shortcuts = await storage.getShortcuts();
    setShortcutsCount(shortcuts.length);

    const profile = await storage.getActiveProfile();
    if (profile) setActiveProfileName(profile.name);

    const pin = await storage.getSecurityPin();
    const bio = await storage.isBiometricsEnabled();
    setIsSecured(!!pin || bio);

    const prefs = await storage.getCalculatorPreferences();
    setIsCamouflaged(prefs.hideSentinelBadge);
    setDisguiseName(prefs.disguiseAppName || 'Calculator');

    const sub = await storage.getSubscription();
    setIsPremium(sub.isPremium);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Sentinel Safety Hub"
        subtitle="Configure discreet emergency protection"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription Status Card */}
        <Card
          variant={isPremium ? 'success' : 'default'}
          onPress={() => navigation.navigate('Subscription')}
          style={styles.premiumCard}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isPremium
                    ? 'rgba(48, 209, 88, 0.15)'
                    : 'rgba(255, 159, 10, 0.15)',
                },
              ]}
            >
              <Crown
                size={22}
                color={isPremium ? theme.success : theme.warning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.premiumHeader}>
                <Text style={[typography.h3, { color: theme.text }]}>
                  {isPremium ? 'Sentinel Plus Active' : 'Upgrade to Sentinel Plus'}
                </Text>
                <Badge
                  label={isPremium ? 'PRO' : 'FREE'}
                  variant={isPremium ? 'success' : 'warning'}
                />
              </View>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                {isPremium
                  ? 'Unlimited triggers, broadcast SOS & location tracking'
                  : 'Unlock unlimited shortcuts, multi-action SOS & stealth camouflage'}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </View>
        </Card>

        {/* Section: Core Safety */}
        <Text style={[typography.caption, styles.sectionTitle, { color: theme.textMuted }]}>
          EMERGENCY SYSTEM CONFIGURATION
        </Text>

        {/* Emergency Shortcuts */}
        <Card
          onPress={() => navigation.navigate('ShortcutsList')}
          style={styles.card}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
              ]}
            >
              <Zap size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Emergency Shortcuts
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                {shortcutsCount} trigger sequence(s) active
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </View>
        </Card>

        {/* Emergency Contacts */}
        <Card
          onPress={() => navigation.navigate('ContactsList')}
          style={styles.card}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(48, 209, 88, 0.15)' },
              ]}
            >
              <Users size={20} color={theme.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Emergency Contacts
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                {contactsCount} contact(s) configured
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </View>
        </Card>

        {/* Situational Profiles */}
        <Card
          onPress={() => navigation.navigate('Profiles')}
          style={styles.card}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(175, 82, 222, 0.15)' },
              ]}
            >
              <Sliders size={20} color="#AF52DE" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Situational Profiles
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Current: {activeProfileName}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </View>
        </Card>

        {/* Section: Stealth & Security */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted, marginTop: 14 },
          ]}
        >
          STEALTH & DISGUISE CONTROLS
        </Text>

        {/* App Name & Icon Disguise */}
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
              <Smartphone size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                App Name & Icon Disguise
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                Displaying as: "{disguiseName}"
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </View>
        </Card>

        {/* Camouflage & Gestures */}
        <Card
          onPress={() => navigation.navigate('CamouflageSettings')}
          style={styles.card}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(255, 159, 10, 0.15)' },
              ]}
            >
              <EyeOff size={20} color={theme.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Camouflage & Secret Gestures
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                {isCamouflaged ? 'Disguised (Badge Hidden)' : 'Visible Sentinel Badge'}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </View>
        </Card>

        {/* App Security & Lock */}
        <Card
          onPress={() => navigation.navigate('Security')}
          style={styles.card}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
              ]}
            >
              <Lock size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Security & Biometrics
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                {isSecured ? 'Protected with PIN / Biometrics' : 'Not locked'}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </View>
        </Card>

        {/* Section: Appearance */}
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: theme.textMuted, marginTop: 14 },
          ]}
        >
          APP PREFERENCES
        </Text>

        {/* Theme Switch */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: 'rgba(255, 214, 10, 0.15)' },
              ]}
            >
              {isDark ? (
                <Moon size={20} color="#FFD60A" />
              ) : (
                <Sun size={20} color="#FF9F0A" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Dark Mode
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                High-contrast OLED black theme
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>
        </Card>

        {/* Sentinel Shield Info Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBrand}>
            <ShieldCheck size={18} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[typography.h3, { color: theme.text, fontSize: 14 }]}>
              Sentinel Safety Engine v1.0.0
            </Text>
          </View>
          <Text
            style={[
              typography.bodySmall,
              { color: theme.textMuted, textAlign: 'center', marginTop: 4 },
            ]}
          >
            Calculate normally. Be ready when it matters.
          </Text>
        </View>
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
  premiumCard: {
    marginBottom: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
