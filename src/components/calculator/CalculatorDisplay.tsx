import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme';
import { Delete } from 'lucide-react-native';

interface CalculatorDisplayProps {
  value: string;
  expression: string;
  onBackspace: () => void;
  onOpenHistory?: () => void;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  value,
  expression,
  onBackspace,
  onOpenHistory,
}) => {
  const { theme, typography } = useTheme();

  // Dynamic font sizing for long numbers
  const getDynamicFontSize = (text: string) => {
    const len = text.length;
    if (len <= 6) return 64;
    if (len <= 8) return 52;
    if (len <= 10) return 42;
    return 34;
  };

  return (
    <View style={styles.container}>
      {/* Expression / Formula Row */}
      <View style={styles.expressionRow}>
        <TouchableOpacity
          onPress={onOpenHistory}
          activeOpacity={0.6}
          style={styles.expressionTouchable}
        >
          <Text
            style={[
              typography.bodyLarge,
              styles.expressionText,
              { color: theme.textSecondary },
            ]}
            numberOfLines={1}
            ellipsizeMode="head"
          >
            {expression || ' '}
          </Text>
        </TouchableOpacity>

        {value !== '0' && value !== 'Error' && (
          <TouchableOpacity
            onPress={onBackspace}
            style={styles.backspaceButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Delete size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Result / Display Number */}
      <View style={styles.mainValueRow}>
        <Text
          style={[
            typography.calcDisplay,
            {
              fontSize: getDynamicFontSize(value),
              color: value === 'Error' ? theme.danger : theme.text,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    justifyContent: 'flex-end',
    minHeight: 160,
  },
  expressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
    marginBottom: 4,
  },
  expressionTouchable: {
    flex: 1,
  },
  expressionText: {
    textAlign: 'right',
  },
  backspaceButton: {
    marginLeft: 12,
    padding: 4,
  },
  mainValueRow: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
