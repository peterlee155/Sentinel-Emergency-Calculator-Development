import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmergencyShortcut } from '../types/shortcuts';
import storage from '../storage';
import shortcutDetectionService from '../services/shortcuts/shortcutDetectionService';
import { Plus, Zap, Play, ChevronRight } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ShortcutsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { theme, typography, borderRadius } = useTheme();
  const [shortcuts, setShortcuts] = useState<EmergencyShortcut[]>([]);

  useEffect(() => {
    if (isFocused) {
      loadShortcuts();
    }
  }, [isFocused]);

  const loadShortcuts = async () => {
    const data = await storage.getShortcuts();
    setShortcuts(data);
  };

  const handleToggle = async (id: string, currentVal: boolean) => {
    await shortcutDetectionService.toggleShortcut(id, !currentVal);
    await loadShortcuts();
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CALL_CONTACT':
        return 'primary';
      case 'SEND_SMS':
      case 'EMERGENCY_MESSAGE':
        return 'warning';
      case 'SEND_LOCATION':
        return 'success';
      case 'ALARM':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const renderShortcutItem = ({ item }: { item: EmergencyShortcut }) => {
    return (
      <Card
        onPress={() =>
          navigation.navigate('CreateShortcut', { shortcutId: item.id })
        }
        style={[
          styles.card,
          !item.enabled && { opacity: 0.6 },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleCol}>
            <Text style={[typography.h3, { color: theme.text }]}>
              {item.name}
            </Text>
            <View style={styles.triggerRow}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                TRIGGER:{' '}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: theme.primary, fontWeight: '700', fontFamily: 'monospace' },
                ]}
              >
                {item.trigger}
              </Text>
            </View>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={() => handleToggle(item.id, item.enabled)}
            trackColor={{ false: '#767577', true: theme.primary }}
          />
        </View>

        {item.message && (
          <Text
            style={[
              typography.bodySmall,
              { color: theme.textSecondary, marginTop: 8 },
            ]}
            numberOfLines={2}
          >
            "{item.message}"
          </Text>
        )}

        <View style={[styles.cardFooter, { borderTopColor: theme.divider }]}>
          <Badge
            label={item.actionType.replace('_', ' ')}
            variant={getActionBadgeVariant(item.actionType)}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation?.();
              navigation.navigate('Simulation', { shortcutId: item.id });
            }}
            style={[
              styles.testBtn,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.surfaceBorder,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Play size={12} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[typography.caption, { color: theme.primary }]}>
              Test Safe Simulation
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Emergency Shortcuts"
        subtitle="Configured calculation triggers"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateShortcut', undefined)}
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {shortcuts.length === 0 ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.surfaceElevated },
            ]}
          >
            <Zap size={32} color={theme.textMuted} />
          </View>
          <Text
            style={[
              typography.h3,
              { color: theme.text, marginTop: 16, textAlign: 'center' },
            ]}
          >
            No Shortcuts Configured
          </Text>
          <Text
            style={[
              typography.bodyMedium,
              { color: theme.textSecondary, textAlign: 'center', marginTop: 8 },
            ]}
          >
            Create custom calculation sequences (e.g. 123123123) that trigger
            emergency calls, SMS, or live location sharing.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateShortcut', undefined)}
            style={[
              styles.emptyButton,
              {
                backgroundColor: theme.primary,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <Plus size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={[typography.button, { color: '#FFFFFF' }]}>
              Create First Shortcut
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shortcuts}
          keyExtractor={(item) => item.id}
          renderItem={renderShortcutItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 20,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    marginRight: 8,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 24,
  },
});
