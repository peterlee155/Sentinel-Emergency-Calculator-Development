import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalculatorButton } from './CalculatorButton';
import { KeyInput } from '../../services/calculator/calculatorEngine';
import { Operator } from '../../types/calculator';

interface CalculatorKeypadProps {
  clearLabel: 'AC' | 'C';
  activeOperator: Operator | null;
  onKeyPress: (key: KeyInput) => void;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  clearLabel,
  activeOperator,
  onKeyPress,
}) => {
  return (
    <View style={styles.keypad}>
      {/* Row 1 */}
      <View style={styles.row}>
        <CalculatorButton
          label={clearLabel}
          type={clearLabel === 'AC' ? 'allClear' : 'clear'}
          onPress={() => onKeyPress(clearLabel)}
        />
        <CalculatorButton
          label="±"
          type="negate"
          onPress={() => onKeyPress('±')}
        />
        <CalculatorButton
          label="%"
          type="percent"
          onPress={() => onKeyPress('%')}
        />
        <CalculatorButton
          label="÷"
          type="operator"
          isActiveOperator={activeOperator === '÷'}
          onPress={() => onKeyPress('÷')}
        />
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <CalculatorButton
          label="7"
          type="digit"
          onPress={() => onKeyPress('7')}
        />
        <CalculatorButton
          label="8"
          type="digit"
          onPress={() => onKeyPress('8')}
        />
        <CalculatorButton
          label="9"
          type="digit"
          onPress={() => onKeyPress('9')}
        />
        <CalculatorButton
          label="×"
          type="operator"
          isActiveOperator={activeOperator === '×'}
          onPress={() => onKeyPress('×')}
        />
      </View>

      {/* Row 3 */}
      <View style={styles.row}>
        <CalculatorButton
          label="4"
          type="digit"
          onPress={() => onKeyPress('4')}
        />
        <CalculatorButton
          label="5"
          type="digit"
          onPress={() => onKeyPress('5')}
        />
        <CalculatorButton
          label="6"
          type="digit"
          onPress={() => onKeyPress('6')}
        />
        <CalculatorButton
          label="−"
          type="operator"
          isActiveOperator={activeOperator === '−'}
          onPress={() => onKeyPress('−')}
        />
      </View>

      {/* Row 4 */}
      <View style={styles.row}>
        <CalculatorButton
          label="1"
          type="digit"
          onPress={() => onKeyPress('1')}
        />
        <CalculatorButton
          label="2"
          type="digit"
          onPress={() => onKeyPress('2')}
        />
        <CalculatorButton
          label="3"
          type="digit"
          onPress={() => onKeyPress('3')}
        />
        <CalculatorButton
          label="+"
          type="operator"
          isActiveOperator={activeOperator === '+'}
          onPress={() => onKeyPress('+')}
        />
      </View>

      {/* Row 5 */}
      <View style={styles.row}>
        <CalculatorButton
          label="0"
          type="digit"
          isDoubleWidth
          onPress={() => onKeyPress('0')}
        />
        <CalculatorButton
          label="."
          type="decimal"
          onPress={() => onKeyPress('.')}
        />
        <CalculatorButton
          label="="
          type="equals"
          onPress={() => onKeyPress('=')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keypad: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});
