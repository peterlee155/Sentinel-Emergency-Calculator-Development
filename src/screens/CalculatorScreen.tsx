import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  PanResponder,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { calculatorEngine } from '../services/calculator/calculatorEngine';
import { KeyType, Operator, CalculatorPreferences, DEFAULT_CALCULATOR_PREFERENCES } from '../types/calculator';
import { CalculatorButton } from '../components/calculator/CalculatorButton';
import { HistoryModal } from '../components/calculator/HistoryModal';
import { CalculationHistoryItem } from '../types/calculator';
import { EmergencyShortcut } from '../types/shortcuts';
import shortcutDetectionService from '../services/shortcuts/shortcutDetectionService';
import emergencyActionService from '../services/emergency/emergencyActionService';
import storage from '../storage';
import * as Haptics from 'expo-haptics';
import { History, Shield, AlertTriangle } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CalculatorScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { theme, typography, isDark } = useTheme();

  const [state, setState] = useState(calculatorEngine.getState());
  const [historyVisible, setHistoryVisible] = useState(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [preferences, setPreferences] = useState<CalculatorPreferences>(
    DEFAULT_CALCULATOR_PREFERENCES
  );

  // Countdown state for COUNTDOWN execution mode
  const [countdownShortcut, setCountdownShortcut] = useState<EmergencyShortcut | null>(null);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    StatusBar.setHidden(true, 'none');
    if (isFocused) {
      loadPreferences();
    }
  }, [isFocused]);

  const loadPreferences = async () => {
    const p = await storage.getCalculatorPreferences();
    setPreferences(p);
  };

  useEffect(() => {
    const unsubscribeTrigger = shortcutDetectionService.onTrigger(
      async (shortcut: EmergencyShortcut, requireConfirmation: boolean) => {
        handleTriggerMatched(shortcut, requireConfirmation);
      }
    );

    const unsubscribeUnlock = shortcutDetectionService.onSecretUnlock(() => {
      navigation.navigate('Settings');
    });

    return () => {
      unsubscribeTrigger();
      unsubscribeUnlock();
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [navigation]);

  const handleTriggerMatched = async (
    shortcut: EmergencyShortcut,
    requireConfirmation: boolean
  ) => {
    const mode = shortcut.executionMode || (requireConfirmation ? 'CONFIRMATION' : 'INSTANT');

    if (mode === 'STEALTH') {
      if (shortcut.fakeDisplayResult) {
        calculatorEngine.inputDigit(shortcut.fakeDisplayResult);
        setState({ ...calculatorEngine.getState(), displayValue: shortcut.fakeDisplayResult });
      }
      try {
        await emergencyActionService.executeShortcut(shortcut, false);
      } catch (e) {
        console.error('[Stealth Execution Error]', e);
      }
      return;
    }

    if (mode === 'COUNTDOWN') {
      const duration = shortcut.countdownSeconds || 5;
      setCountdownShortcut(shortcut);
      setCountdownRemaining(duration);

      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      let timeLeft = duration;
      countdownTimerRef.current = setInterval(async () => {
        timeLeft -= 1;
        setCountdownRemaining(timeLeft);
        if (timeLeft <= 0) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setCountdownShortcut(null);
          navigation.navigate('Activation', {
            shortcutId: shortcut.id,
            autoTrigger: true,
          });
        }
      }, 1000);
      return;
    }

    navigation.navigate('Activation', {
      shortcutId: shortcut.id,
      autoTrigger: !requireConfirmation,
    });
  };

  const cancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownShortcut(null);
  };

  const triggerHaptic = () => {
    if (preferences.hapticFeedback === 'off') return;
    if (preferences.hapticFeedback === 'heavy') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (preferences.hapticFeedback === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleKeyPress = async (key: string, type: KeyType) => {
    triggerHaptic();

    switch (type) {
      case 'digit':
        calculatorEngine.inputDigit(key);
        break;
      case 'operator':
        calculatorEngine.setOperator(key as Operator);
        break;
      case 'equals':
        await calculatorEngine.calculate();
        break;
      case 'clear':
        calculatorEngine.clear();
        break;
      case 'allClear':
        calculatorEngine.allClear();
        break;
      case 'backspace':
        calculatorEngine.backspace();
        break;
      case 'negate':
        calculatorEngine.toggleSign();
        break;
      case 'percent':
        calculatorEngine.inputPercent();
        break;
      case 'decimal':
        calculatorEngine.inputDecimal();
        break;
    }

    setState({ ...calculatorEngine.getState() });
    await shortcutDetectionService.checkBuffer();
  };

  const handleBackspace = async () => {
    triggerHaptic();
    calculatorEngine.backspace();
    setState({ ...calculatorEngine.getState() });
    await shortcutDetectionService.checkBuffer();
  };

  const handleLongPressEquals = () => {
    if (preferences.longPressEqualsUnlock) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      navigation.navigate('Settings');
    }
  };

  const handleLongPressAC = () => {
    if (preferences.longPressACUnlock) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      navigation.navigate('Settings');
    }
  };

  const openHistory = async () => {
    const items = await storage.getCalculationHistory();
    setHistory(items);
    setHistoryVisible(true);
  };

  const handleSelectResult = (resultStr: string) => {
    calculatorEngine.allClear();
    calculatorEngine.inputDigit(resultStr);
    setState({ ...calculatorEngine.getState() });
    setHistoryVisible(false);
  };

  const handleClearHistory = async () => {
    await storage.clearCalculationHistory();
    setHistory([]);
  };

  const getDynamicFontSize = (text: string) => {
    const len = text.length;
    if (len > 12) return 34;
    if (len > 9) return 44;
    if (len > 6) return 54;
    return 64;
  };

  // Swipe on display to backspace
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 30) {
          handleBackspace();
        }
      },
    })
  ).current;

  // Generous top padding when notification bar is hidden
  const topPadding = Math.max(insets.top + 16, 40);
  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingLeft: Math.max(insets.left, 12),
          paddingRight: Math.max(insets.right, 12),
        },
      ]}
    >
      <StatusBar hidden={true} />

      {/* Countdown Alert Banner */}
      {countdownShortcut && (
        <View
          style={[
            styles.countdownBanner,
            { backgroundColor: theme.dangerSurface, borderColor: theme.danger },
          ]}
        >
          <View style={styles.countdownRow}>
            <AlertTriangle size={20} color={theme.danger} style={{ marginRight: 8 }} />
            <Text style={[typography.h3, { color: theme.danger, fontSize: 14, flex: 1 }]}>
              Triggering "{countdownShortcut.name}" in {countdownRemaining}s...
            </Text>
            <TouchableOpacity
              onPress={cancelCountdown}
              style={[styles.cancelBtn, { backgroundColor: theme.danger }]}
            >
              <Text style={[typography.button, { color: '#FFFFFF', fontSize: 12 }]}>
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={openHistory}
          style={[
            styles.headerButton,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder },
          ]}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <History size={22} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Camouflage Mode: Only show badge if NOT hidden */}
        {!preferences.hideSentinelBadge ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Settings')}
            style={[
              styles.sentinelBadge,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder },
            ]}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Shield size={16} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[typography.caption, { color: theme.primary, fontWeight: '700', fontSize: 13 }]}>
              SENTINEL
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Display Screen */}
      <View style={styles.displayContainer} {...panResponder.panHandlers}>
        {state.expression ? (
          <Text
            style={[
              typography.caption,
              styles.expressionText,
              { color: theme.textMuted },
            ]}
            numberOfLines={1}
            ellipsizeMode="head"
          >
            {state.expression}
          </Text>
        ) : null}

        <Text
          style={[
            typography.calcDisplay,
            styles.mainDisplay,
            {
              color: theme.text,
              fontSize: getDynamicFontSize(state.displayValue),
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {state.displayValue}
        </Text>
      </View>

      {/* Calculator Keypad */}
      <View style={styles.keypad}>
        {/* Row 1 */}
        <View style={styles.row}>
          <CalculatorButton
            label={state.clearLabel}
            type={state.clearLabel === 'AC' ? 'allClear' : 'clear'}
            onPress={() =>
              handleKeyPress(
                state.clearLabel,
                state.clearLabel === 'AC' ? 'allClear' : 'clear'
              )
            }
            onLongPress={handleLongPressAC}
          />
          <CalculatorButton
            label="⌫"
            type="backspace"
            onPress={handleBackspace}
          />
          <CalculatorButton
            label="±"
            type="negate"
            onPress={() => handleKeyPress('±', 'negate')}
          />
          <CalculatorButton
            label="÷"
            type="operator"
            isActiveOperator={state.operator === '÷'}
            onPress={() => handleKeyPress('÷', 'operator')}
          />
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <CalculatorButton
            label="7"
            type="digit"
            onPress={() => handleKeyPress('7', 'digit')}
          />
          <CalculatorButton
            label="8"
            type="digit"
            onPress={() => handleKeyPress('8', 'digit')}
          />
          <CalculatorButton
            label="9"
            type="digit"
            onPress={() => handleKeyPress('9', 'digit')}
          />
          <CalculatorButton
            label="×"
            type="operator"
            isActiveOperator={state.operator === '×'}
            onPress={() => handleKeyPress('×', 'operator')}
          />
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <CalculatorButton
            label="4"
            type="digit"
            onPress={() => handleKeyPress('4', 'digit')}
          />
          <CalculatorButton
            label="5"
            type="digit"
            onPress={() => handleKeyPress('5', 'digit')}
          />
          <CalculatorButton
            label="6"
            type="digit"
            onPress={() => handleKeyPress('6', 'digit')}
          />
          <CalculatorButton
            label="−"
            type="operator"
            isActiveOperator={state.operator === '−'}
            onPress={() => handleKeyPress('−', 'operator')}
          />
        </View>

        {/* Row 4 */}
        <View style={styles.row}>
          <CalculatorButton
            label="1"
            type="digit"
            onPress={() => handleKeyPress('1', 'digit')}
          />
          <CalculatorButton
            label="2"
            type="digit"
            onPress={() => handleKeyPress('2', 'digit')}
          />
          <CalculatorButton
            label="3"
            type="digit"
            onPress={() => handleKeyPress('3', 'digit')}
          />
          <CalculatorButton
            label="+"
            type="operator"
            isActiveOperator={state.operator === '+'}
            onPress={() => handleKeyPress('+', 'operator')}
          />
        </View>

        {/* Row 5 */}
        <View style={styles.row}>
          <CalculatorButton
            label="0"
            type="digit"
            isDoubleWidth
            onPress={() => handleKeyPress('0', 'digit')}
          />
          <CalculatorButton
            label="."
            type="decimal"
            onPress={() => handleKeyPress('.', 'decimal')}
          />
          <CalculatorButton
            label="="
            type="equals"
            onPress={() => handleKeyPress('=', 'equals')}
            onLongPress={handleLongPressEquals}
          />
        </View>
      </View>

      {/* History Slide-Up Sheet */}
      <HistoryModal
        visible={historyVisible}
        history={history}
        onClose={() => setHistoryVisible(false)}
        onSelectResult={handleSelectResult}
        onClearHistory={handleClearHistory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 56,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sentinelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  countdownBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  expressionText: {
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'right',
  },
  mainDisplay: {
    textAlign: 'right',
    flexShrink: 1,
  },
  keypad: {
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});
