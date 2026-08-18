import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral' }) => {
  const { theme, typography, borderRadius } = useTheme();

  let bg = theme.surfaceElevated;
  let textColor = theme.textSecondary;

  switch (variant) {
    case 'primary':
      bg = 'rgba(10, 132, 255, 0.18)';
      textColor = theme.primary;
      break;
    case 'success':
      bg = theme.successSurface;
      textColor = theme.success;
      break;
    case 'warning':
      bg = theme.warningSurface;
      textColor = theme.warning;
      break;
    case 'danger':
      bg = theme.dangerSurface;
      textColor = theme.danger;
      break;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderRadius: borderRadius.sm,
        },
      ]}
    >
      <Text style={[typography.caption, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
});
