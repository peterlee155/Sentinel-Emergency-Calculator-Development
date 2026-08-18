import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmergencyProfile } from '../types/profiles';
import storage from '../storage';
import {
  Home,
  Compass,
  Moon,
  Briefcase,
  Shield,
  Heart,
  Lock,
  Zap,
  Plus,
  Edit2,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ICON_MAP: Record<string, any> = {
  home: Home,
  travel: Compass,
  night: Moon,
  work: Briefcase,
  shield: Shield,
  heart: Heart,
  lock: Lock,
  zap: Zap,
};

export const ProfilesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { theme, typography, borderRadius } = useTheme();
  const [profiles, setProfiles] = useState<EmergencyProfile[]>([]);

  useEffect(() => {
    if (isFocused) {
      loadProfiles();
    }
  }, [isFocused]);

  const loadProfiles = async () => {
    const list = await storage.getProfiles();
    setProfiles(list);
  };

  const handleSetActive = async (id: string) => {
    const updated = profiles.map((p) => ({
      ...p,
      isActive: p.id === id,
    }));
    await storage.saveProfiles(updated);
    setProfiles(updated);
  };

  const renderProfileItem = ({ item }: { item: EmergencyProfile }) => {
    const IconComp = ICON_MAP[item.icon || 'shield'] || Shield;
    const isSelected = item.isActive;
    const accentColor = item.color || theme.primary;

    return (
      <Card
        onPress={() => handleSetActive(item.id)}
        style={[
          styles.card,
          isSelected && {
            borderColor: accentColor,
            backgroundColor: `${accentColor}12`,
          },
        ]}
      >
        <View style={styles.cardRow}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isSelected
                  ? accentColor
                  : theme.surfaceElevated,
              },
            ]}
          >
            <IconComp
              size={20}
              color={isSelected ? '#FFFFFF' : theme.textSecondary}
            />
          </View>

          <View style={styles.textCol}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  typography.h3,
                  { color: isSelected ? accentColor : theme.text },
                ]}
              >
                {item.name}
              </Text>
              <View style={styles.badgeGroup}>
                {isSelected && (
                  <Badge
                    label="ACTIVE"
                    variant="primary"
                  />
                )}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation?.();
                    navigation.navigate('CreateProfile', { profileId: item.id });
                  }}
                  style={styles.editIconBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit2 size={16} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <Text
              style={[
                typography.bodySmall,
                { color: theme.textSecondary, marginTop: 4 },
              ]}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Situational Profiles"
        subtitle="Custom presets for your safety needs"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateProfile', undefined)}
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={renderProfileItem}
        contentContainerStyle={styles.list}
      />
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
  cardRow: {
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
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIconBtn: {
    marginLeft: 10,
    padding: 4,
  },
});
