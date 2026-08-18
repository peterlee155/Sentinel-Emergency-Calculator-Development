import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'danger' | 'warning' | 'success';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const { theme, borderRadius } = useTheme();

  let backgroundColor = theme.surface;
  let borderColor = theme.surfaceBorder;

  if (variant === 'elevated') {
    backgroundColor = theme.surfaceElevated;
  } else if (variant === 'danger') {
    backgroundColor = theme.dangerSurface;
    borderColor = theme.danger;
  } else if (variant === 'warning') {
    backgroundColor = theme.warningSurface;
    borderColor = theme.warning;
  } else if (variant === 'success') {
    backgroundColor = theme.successSurface;
    borderColor = theme.success;
  }

  const cardStyle = [
    styles.container,
    {
      backgroundColor,
      borderColor,
      borderRadius: borderRadius.lg,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    marginVertical: 6,
  },
});
