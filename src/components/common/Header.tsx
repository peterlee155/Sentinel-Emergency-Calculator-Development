import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { ChevronLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, typography } = useTheme();

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 16
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topInset,
          borderBottomColor: theme.divider,
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.leftRow}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={[
                styles.backButton,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder },
              ]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={22} color={theme.text} />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={[typography.h2, { color: theme.text, fontSize: 18 }]}>
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2, fontSize: 13 },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  rightAction: {
    marginLeft: 12,
  },
});
