import {
  CalculatorState,
  Operator,
  CalculationHistoryItem,
} from '../../types/calculator';
import storage from '../../storage';
import { shortcutBuffer } from '../shortcuts/shortcutBuffer';

export type KeyInput =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | '.' | '+' | '−' | '×' | '÷' | '=' | 'AC' | 'C' | '±' | '%' | '⌫';

export const INITIAL_CALCULATOR_STATE: CalculatorState = {
  displayValue: '0',
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  clearLabel: 'AC',
  expression: '',
};

export class CalculatorEngine {
  private static instance: CalculatorEngine;
  private state: CalculatorState = { ...INITIAL_CALCULATOR_STATE };

  private constructor() {}

  public static getInstance(): CalculatorEngine {
    if (!CalculatorEngine.instance) {
      CalculatorEngine.instance = new CalculatorEngine();
    }
    return CalculatorEngine.instance;
  }

  public getState(): CalculatorState {
    return { ...this.state };
  }

  public reset(): void {
    this.state = { ...INITIAL_CALCULATOR_STATE };
  }

  public handleInput(key: KeyInput): CalculatorState {
    if (/^[0-9]$/.test(key)) {
      return this.inputDigit(key);
    }
    if (key === '.') {
      return this.inputDecimal();
    }
    if (key === '+' || key === '−' || key === '×' || key === '÷') {
      return this.setOperator(key as Operator);
    }
    if (key === '=') {
      this.calculate();
      return this.getState();
    }
    if (key === 'AC') {
      return this.allClear();
    }
    if (key === 'C') {
      return this.clear();
    }
    if (key === '±') {
      return this.toggleSign();
    }
    if (key === '%') {
      return this.inputPercent();
    }
    if (key === '⌫') {
      return this.backspace();
    }
    return this.getState();
  }

  public inputDigit(digit: string): CalculatorState {
    shortcutBuffer.append(digit);

    const { displayValue, waitingForOperand } = this.state;

    if (waitingForOperand) {
      this.state = {
        ...this.state,
        displayValue: digit,
        waitingForOperand: false,
        clearLabel: 'C',
      };
    } else {
      if (displayValue === '0' || displayValue === 'Error') {
        this.state = {
          ...this.state,
          displayValue: digit,
          clearLabel: 'C',
        };
      } else {
        if (displayValue.replace(/[-.]/g, '').length < 12) {
          this.state = {
            ...this.state,
            displayValue: `${displayValue}${digit}`,
            clearLabel: 'C',
          };
        }
      }
    }

    return this.state;
  }

  public inputDecimal(): CalculatorState {
    shortcutBuffer.append('.');

    const { displayValue, waitingForOperand } = this.state;

    if (waitingForOperand) {
      this.state = {
        ...this.state,
        displayValue: '0.',
        waitingForOperand: false,
        clearLabel: 'C',
      };
    } else if (!displayValue.includes('.')) {
      this.state = {
        ...this.state,
        displayValue: `${displayValue}.`,
        clearLabel: 'C',
      };
    }

    return this.state;
  }

  public toggleSign(): CalculatorState {
    const { displayValue } = this.state;
    if (displayValue === '0' || displayValue === 'Error') {
      return this.state;
    }

    if (displayValue.startsWith('-')) {
      this.state = {
        ...this.state,
        displayValue: displayValue.substring(1),
      };
    } else {
      this.state = {
        ...this.state,
        displayValue: `-${displayValue}`,
      };
    }

    return this.state;
  }

  public inputPercent(): CalculatorState {
    const { displayValue } = this.state;
    const num = parseFloat(displayValue);
    if (isNaN(num) || displayValue === 'Error') {
      return this.state;
    }

    const result = num / 100;
    this.state = {
      ...this.state,
      displayValue: this.formatNumber(result),
    };

    return this.state;
  }

  public setOperator(nextOperator: Operator): CalculatorState {
    return this.handleOperator(nextOperator);
  }

  public clear(): CalculatorState {
    return this.handleClear();
  }

  public allClear(): CalculatorState {
    this.state = { ...INITIAL_CALCULATOR_STATE };
    return this.state;
  }

  public backspace(): CalculatorState {
    shortcutBuffer.backspace();
    const { displayValue, waitingForOperand } = this.state;

    if (waitingForOperand || displayValue === 'Error') {
      return this.state;
    }

    if (
      displayValue.length === 1 ||
      (displayValue.length === 2 && displayValue.startsWith('-'))
    ) {
      this.state = {
        ...this.state,
        displayValue: '0',
        clearLabel: this.state.previousValue ? 'C' : 'AC',
      };
    } else {
      this.state = {
        ...this.state,
        displayValue: displayValue.slice(0, -1),
      };
    }

    return this.state;
  }

  private handleClear(): CalculatorState {
    if (this.state.clearLabel === 'C') {
      this.state = {
        ...this.state,
        displayValue: '0',
        clearLabel: 'AC',
      };
    } else {
      this.state = {
        ...INITIAL_CALCULATOR_STATE,
      };
    }
    return this.state;
  }

  private handleOperator(nextOperator: Operator): CalculatorState {
    const { displayValue, previousValue, operator } = this.state;
    const inputValue = parseFloat(displayValue);

    if (isNaN(inputValue) || displayValue === 'Error') {
      return this.state;
    }

    if (previousValue === null) {
      this.state = {
        ...this.state,
        previousValue: displayValue,
        operator: nextOperator,
        waitingForOperand: true,
        expression: `${displayValue} ${nextOperator}`,
      };
    } else if (operator && !this.state.waitingForOperand) {
      const prevVal = parseFloat(previousValue);
      const calculated = this.compute(prevVal, inputValue, operator);

      if (calculated === 'Error') {
        this.state = {
          displayValue: 'Error',
          previousValue: null,
          operator: null,
          waitingForOperand: false,
          clearLabel: 'AC',
          expression: '',
        };
      } else {
        this.state = {
          displayValue: calculated,
          previousValue: calculated,
          operator: nextOperator,
          waitingForOperand: true,
          clearLabel: 'C',
          expression: `${calculated} ${nextOperator}`,
        };
      }
    } else {
      this.state = {
        ...this.state,
        operator: nextOperator,
        expression: `${previousValue} ${nextOperator}`,
      };
    }

    return this.state;
  }

  public async calculate(): Promise<CalculatorState> {
    shortcutBuffer.append('=');

    const { displayValue, previousValue, operator, expression } = this.state;
    const inputValue = parseFloat(displayValue);

    if (operator === null || previousValue === null) {
      return this.state;
    }

    if (isNaN(inputValue) || displayValue === 'Error') {
      return this.state;
    }

    const prevVal = parseFloat(previousValue);
    const calculated = this.compute(prevVal, inputValue, operator);

    if (calculated !== 'Error') {
      const fullExpression = `${previousValue} ${operator} ${displayValue}`;
      const historyItem: CalculationHistoryItem = {
        id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        expression: fullExpression,
        result: calculated,
        timestamp: Date.now(),
      };
      await storage.saveCalculation(historyItem);
    }

    this.state = {
      displayValue: calculated,
      previousValue: null,
      operator: null,
      waitingForOperand: true,
      clearLabel: 'AC',
      expression: `${expression} ${displayValue} =`,
    };

    return this.state;
  }

  private compute(prev: number, current: number, op: Operator): string {
    let result = 0;
    switch (op) {
      case '+':
        result = prev + current;
        break;
      case '−':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        if (current === 0) return 'Error';
        result = prev / current;
        break;
      default:
        return 'Error';
    }

    return this.formatNumber(result);
  }

  public formatNumber(num: number): string {
    if (!isFinite(num)) return 'Error';
    const formatted = parseFloat(num.toPrecision(10)).toString();
    if (formatted.length > 12) {
      if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(5);
      }
    }
    return formatted;
  }
}

export const calculatorEngine = CalculatorEngine.getInstance();
export default calculatorEngine;
