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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
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
  Trash2,
} from 'lucide-react-native';

const COLOR_PALETTE = [
  '#0A84FF', // Blue
  '#30D158', // Green
  '#FF9F0A', // Orange
  '#FF453A', // Red
  '#AF52DE', // Purple
  '#64D2FF', // Cyan
  '#FFD60A', // Yellow
  '#8E8E93', // Gray
];

const ICON_CHOICES: { key: string; icon: any; label: string }[] = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'travel', icon: Compass, label: 'Travel' },
  { key: 'night', icon: Moon, label: 'Night' },
  { key: 'work', icon: Briefcase, label: 'Work' },
  { key: 'shield', icon: Shield, label: 'Shield' },
  { key: 'heart', icon: Heart, label: 'Safety' },
  { key: 'lock', icon: Lock, label: 'Discreet' },
  { key: 'zap', icon: Zap, label: 'Active' },
];

export const CreateProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateProfile'>>();
  const profileId = route.params?.profileId;

  const { theme, typography, borderRadius } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [selectedIcon, setSelectedIcon] = useState('shield');
  const [isCustom, setIsCustom] = useState(true);

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    if (!profileId) return;
    const profiles = await storage.getProfiles();
    const p = profiles.find((item) => item.id === profileId);
    if (p) {
      setName(p.name);
      setDescription(p.description);
      setSelectedColor(p.color || COLOR_PALETTE[0]);
      setSelectedIcon(p.icon || 'shield');
      setIsCustom(p.isCustom ?? true);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a profile name.');
      return;
    }

    await storage.saveProfile({
      id: profileId,
      name: name.trim(),
      description: description.trim() || 'Custom situational safety profile',
      isActive: false,
      shortcutIds: [],
      isCustom: true,
      color: selectedColor,
      icon: selectedIcon,
    });

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!profileId) return;
    Alert.alert(
      'Delete Profile',
      `Delete profile "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storage.deleteProfile(profileId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={profileId ? 'Edit Profile' : 'New Safety Profile'}
        subtitle="Custom situational configuration"
        onBack={() => navigation.goBack()}
        rightAction={
          profileId && isCustom ? (
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
          PROFILE NAME
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Solo Commute, Campus Walk, Party"
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

        {/* Description Field */}
        <Text style={[typography.caption, styles.label, { color: theme.textMuted }]}>
          DESCRIPTION / SITUATION
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Active when walking home alone late at night"
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

        {/* Color Tag Selection */}
        <Text style={[typography.caption, styles.label, { color: theme.textMuted, marginTop: 14 }]}>
          COLOR ACCENT
        </Text>
        <View style={styles.colorRow}>
          {COLOR_PALETTE.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  isSelected && styles.colorCircleSelected,
                ]}
              />
            );
          })}
        </View>

        {/* Icon Selection */}
        <Text style={[typography.caption, styles.label, { color: theme.textMuted, marginTop: 18 }]}>
          PROFILE ICON
        </Text>
        <View style={styles.iconGrid}>
          {ICON_CHOICES.map((choice) => {
            const IconComponent = choice.icon;
            const isSelected = selectedIcon === choice.key;
            return (
              <TouchableOpacity
                key={choice.key}
                onPress={() => setSelectedIcon(choice.key)}
                style={[
                  styles.iconChoiceBtn,
                  {
                    backgroundColor: isSelected
                      ? selectedColor
                      : theme.surfaceElevated,
                    borderColor: isSelected
                      ? selectedColor
                      : theme.surfaceBorder,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <IconComponent
                  size={20}
                  color={isSelected ? '#FFFFFF' : theme.textSecondary}
                />
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      marginTop: 4,
                      fontSize: 10,
                    },
                  ]}
                >
                  {choice.label}
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
              backgroundColor: selectedColor || theme.primary,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          <Text style={[typography.button, { color: '#FFFFFF' }]}>
            {profileId ? 'Update Safety Profile' : 'Save Safety Profile'}
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
    marginBottom: 16,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    marginBottom: 10,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 28,
  },
  iconChoiceBtn: {
    width: '22%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '3%',
    marginBottom: 10,
    borderWidth: 1,
  },
  saveButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  deleteBtn: {
    padding: 4,
  },
});
