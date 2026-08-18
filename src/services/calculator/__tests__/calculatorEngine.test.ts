import { describe, test, expect, beforeEach } from '@jest/globals';
import { CalculatorEngine } from '../calculatorEngine';
import { shortcutBuffer } from '../../shortcuts/shortcutBuffer';

describe('CalculatorEngine', () => {
  let engine: CalculatorEngine;

  beforeEach(() => {
    engine = CalculatorEngine.getInstance();
    engine.allClear();
    shortcutBuffer.clear();
  });

  test('handles basic digit input', () => {
    engine.inputDigit('1');
    engine.inputDigit('2');
    engine.inputDigit('3');
    expect(engine.getState().displayValue).toBe('123');
    expect(shortcutBuffer.getBuffer()).toBe('123');
  });

  test('performs addition correctly with 0.1 + 0.2 precision fix', async () => {
    engine.inputDigit('0');
    engine.inputDecimal();
    engine.inputDigit('1');
    engine.setOperator('+');
    engine.inputDigit('0');
    engine.inputDecimal();
    engine.inputDigit('2');
    const result = await engine.calculate();
    expect(result.displayValue).toBe('0.3');
  });

  test('performs subtraction, multiplication and division', async () => {
    // 50 - 20 = 30
    engine.inputDigit('5');
    engine.inputDigit('0');
    engine.setOperator('−');
    engine.inputDigit('2');
    engine.inputDigit('0');
    expect((await engine.calculate()).displayValue).toBe('30');

    // 6 * 7 = 42
    engine.allClear();
    engine.inputDigit('6');
    engine.setOperator('×');
    engine.inputDigit('7');
    expect((await engine.calculate()).displayValue).toBe('42');

    // 45 / 9 = 5
    engine.allClear();
    engine.inputDigit('4');
    engine.inputDigit('5');
    engine.setOperator('÷');
    engine.inputDigit('9');
    expect((await engine.calculate()).displayValue).toBe('5');
  });

  test('handles division by zero gracefully', async () => {
    engine.inputDigit('8');
    engine.setOperator('÷');
    engine.inputDigit('0');
    const res = await engine.calculate();
    expect(res.displayValue).toBe('Error');
  });

  test('handles toggle sign +/-', () => {
    engine.inputDigit('4');
    engine.inputDigit('2');
    engine.toggleSign();
    expect(engine.getState().displayValue).toBe('-42');
    engine.toggleSign();
    expect(engine.getState().displayValue).toBe('42');
  });

  test('handles backspace key', () => {
    engine.inputDigit('9');
    engine.inputDigit('8');
    engine.inputDigit('7');
    engine.backspace();
    expect(engine.getState().displayValue).toBe('98');
    engine.backspace();
    expect(engine.getState().displayValue).toBe('9');
    engine.backspace();
    expect(engine.getState().displayValue).toBe('0');
  });

  test('handles C and AC clear transitions', async () => {
    engine.inputDigit('5');
    engine.setOperator('+');
    engine.inputDigit('9');
    expect(engine.getState().clearLabel).toBe('C');
    engine.clear();
    expect(engine.getState().displayValue).toBe('0');
    expect(engine.getState().clearLabel).toBe('AC');
    engine.inputDigit('3');
    expect((await engine.calculate()).displayValue).toBe('8');
  });

  test('records continuous emergency trigger sequences in rolling buffer', () => {
    const sequence = '123123123';
    for (const ch of sequence) {
      engine.inputDigit(ch);
    }
    expect(shortcutBuffer.getBuffer()).toBe('123123123');
  });
});
