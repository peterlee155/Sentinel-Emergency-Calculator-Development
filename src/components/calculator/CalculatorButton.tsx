import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { KeyType } from '../../types/calculator';

interface CalculatorButtonProps {
  label: string;
  type: KeyType;
  isActiveOperator?: boolean;
  isDoubleWidth?: boolean;
  onPress: (label: string) => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  label,
  type,
  isActiveOperator = false,
  isDoubleWidth = false,
  onPress,
  onLongPress,
  style,
}) => {
  const { theme, typography } = useTheme();

  const handlePress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Haptics fallback
    }
    onPress(label);
  };

  let bgColor = theme.keyDigitBg;
  let textColor = theme.keyDigitText;
  let textStyle = typography.calcKey;

  if (type === 'operator' || type === 'equals') {
    if (isActiveOperator) {
      bgColor = theme.keyOpActiveBg;
      textColor = theme.keyOpActiveText;
    } else {
      bgColor = theme.keyOpBg;
      textColor = theme.keyOpText;
    }
    textStyle = typography.calcKey;
  } else if (
    type === 'clear' ||
    type === 'allClear' ||
    type === 'negate' ||
    type === 'percent' ||
    type === 'backspace'
  ) {
    bgColor = theme.keyFnBg;
    textColor = theme.keyFnText;
    textStyle = typography.calcKeyFn;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={1200}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: theme.surfaceBorder,
        },
        isDoubleWidth ? styles.doubleWidthButton : styles.singleWidthButton,
        style,
      ]}
    >
      <Text
        style={[
          textStyle,
          { color: textColor },
          isDoubleWidth && styles.doubleWidthText,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderWidth: 0.5,
  },
  singleWidthButton: {
    flex: 1,
  },
  doubleWidthButton: {
    flex: 2.1,
    alignItems: 'flex-start',
    paddingLeft: 28,
  },
  doubleWidthText: {
    textAlign: 'left',
  },
});
