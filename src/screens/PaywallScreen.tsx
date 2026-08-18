import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import subscriptionService from '../services/subscriptions/subscriptionService';
import storage from '../storage';
import { SubscriptionState } from '../types/subscriptions';
import {
  Crown,
  Check,
  Zap,
  Users,
  Compass,
  MapPin,
  Lock,
  RefreshCw,
} from 'lucide-react-native';

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, typography, borderRadius } = useTheme();

  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubState();
  }, []);

  const loadSubState = async () => {
    const state = await storage.getSubscription();
    setSubscription(state);
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const success = await subscriptionService.purchasePremium(selectedPlan);
      if (success) {
        Alert.alert(
          'Sentinel Plus Activated',
          'Thank you for supporting Sentinel! All premium features are now unlocked.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (e: any) {
      Alert.alert('Purchase Error', e.message || 'Unable to process purchase.');
    } finally {
      setLoading(false);
      await loadSubState();
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await subscriptionService.restorePurchases();
      if (restored) {
        Alert.alert('Restored', 'Your Sentinel Plus subscription was successfully restored.');
      } else {
        Alert.alert('Notice', 'No previous active Sentinel Plus purchase was found.');
      }
    } catch (e: any) {
      Alert.alert('Restore Failed', e.message || 'Unable to restore purchases.');
    } finally {
      setLoading(false);
      await loadSubState();
    }
  };

  const handleResetForTesting = async () => {
    await subscriptionService.resetToFree();
    await loadSubState();
    Alert.alert('Reset', 'Subscription state reset to Free tier.');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Sentinel Plus"
        subtitle="Uncompromised personal safety"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={handleRestore}
            style={styles.restoreBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[typography.caption, { color: theme.primary }]}>
              RESTORE
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.crownCircle,
              { backgroundColor: 'rgba(255, 159, 10, 0.15)' },
            ]}
          >
            <Crown size={36} color={theme.keyOpBg} />
          </View>
          <Text
            style={[
              typography.h1,
              { color: theme.text, textAlign: 'center', marginTop: 16 },
            ]}
          >
            Upgrade to Plus
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              {
                color: theme.textSecondary,
                textAlign: 'center',
                marginTop: 8,
                paddingHorizontal: 16,
              },
            ]}
          >
            Empower your calculator with limitless emergency shortcuts, unlimited
            contacts, and GPS automation.
          </Text>
        </View>

        {/* Feature List */}
        <View style={styles.featuresList}>
          {[
            {
              icon: Zap,
              title: 'Unlimited Shortcuts',
              desc: 'Create as many secret calculator triggers as you need',
            },
            {
              icon: Users,
              title: 'Unlimited Emergency Contacts',
              desc: 'Alert family, partners, doctors, and friends simultaneously',
            },
            {
              icon: Compass,
              title: 'Situational Profiles',
              desc: 'Switch triggers for Home, Travel, Night, and Workplace',
            },
            {
              icon: MapPin,
              title: 'Live GPS Location Integration',
              desc: 'Automatically attach exact GPS coordinates & Google Maps link',
            },
            {
              icon: Lock,
              title: 'Biometric & Master PIN Security',
              desc: 'Keep your safety triggers completely protected from tampering',
            },
          ].map((item, index) => {
            const IconComp = item.icon;
            return (
              <View key={index} style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIconBox,
                    { backgroundColor: theme.surfaceElevated },
                  ]}
                >
                  <IconComp size={18} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h3, { color: theme.text, fontSize: 15 }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      typography.bodySmall,
                      { color: theme.textSecondary, marginTop: 2 },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Pricing Selection */}
        <Text
          style={[
            typography.caption,
            styles.pricingTitle,
            { color: theme.textMuted },
          ]}
        >
          CHOOSE MEMBERSHIP
        </Text>

        <View style={styles.plansRow}>
          {/* Monthly Plan */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('monthly')}
            style={[
              styles.planCard,
              {
                backgroundColor: theme.surface,
                borderColor:
                  selectedPlan === 'monthly'
                    ? theme.primary
                    : theme.surfaceBorder,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              MONTHLY
            </Text>
            <Text style={[typography.h2, { color: theme.text, marginTop: 6 }]}>
              $1.99
            </Text>
            <Text style={[typography.bodySmall, { color: theme.textMuted }]}>
              per month
            </Text>
          </TouchableOpacity>

          {/* Lifetime Plan */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('lifetime')}
            style={[
              styles.planCard,
              {
                backgroundColor: theme.surface,
                borderColor:
                  selectedPlan === 'lifetime'
                    ? theme.primary
                    : theme.surfaceBorder,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <View style={styles.badgeWrapper}>
              <Badge label="BEST VALUE" variant="primary" />
            </View>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              LIFETIME
            </Text>
            <Text style={[typography.h2, { color: theme.text, marginTop: 6 }]}>
              $19.99
            </Text>
            <Text style={[typography.bodySmall, { color: theme.textMuted }]}>
              one-time payment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePurchase}
          disabled={loading}
          style={[
            styles.purchaseButton,
            {
              backgroundColor: theme.primary,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[typography.button, { color: '#FFFFFF' }]}>
              {subscription?.isPremium
                ? 'Subscription Active'
                : `Subscribe for ${selectedPlan === 'monthly' ? '$1.99 / Month' : '$19.99 Lifetime'}`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Disclaimer / Transparency Note */}
        <Text
          style={[
            typography.bodySmall,
            styles.legalText,
            { color: theme.textMuted },
          ]}
        >
          Sentinel never paywalls essential emergency contact access. Free tier
          includes full calculator, emergency actions, and personal contact alerts.
          Subscriptions auto-renew unless cancelled at least 24 hours before the end
          of the current period in store settings.
        </Text>

        {/* Developer Sandbox Reset */}
        <TouchableOpacity
          onPress={handleResetForTesting}
          style={styles.sandboxReset}
        >
          <Text style={[typography.caption, { color: theme.textMuted }]}>
            [TESTING] Reset to Free Tier
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
  restoreBtn: {
    padding: 4,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresList: {
    marginVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  pricingTitle: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  plansRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    marginHorizontal: 4,
    position: 'relative',
  },
  badgeWrapper: {
    position: 'absolute',
    top: -10,
    right: 8,
  },
  purchaseButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  legalText: {
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  sandboxReset: {
    marginTop: 24,
    alignItems: 'center',
  },
});
