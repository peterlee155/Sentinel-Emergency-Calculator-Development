// Standalone Node verification script for Calculator Engine & Trigger Buffer
const { CalculatorEngine } = require('../calculatorEngine');
const { ShortcutBuffer } = require('../../shortcuts/shortcutBuffer');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Testing Calculator Engine ---');

const emittedChars = [];
const engine = new CalculatorEngine(undefined, (char) => {
  emittedChars.push(char);
});

// 1. Basic digit input
engine.handleInput('1');
engine.handleInput('2');
engine.handleInput('3');
assert(engine.getState().displayValue === '123', 'Digit input 123');
assert(emittedChars.join('') === '123', 'Keystroke trigger emission 123');

// 2. Precision arithmetic: 0.1 + 0.2 = 0.3
engine.handleInput('AC');
engine.handleInput('0');
engine.handleInput('.');
engine.handleInput('1');
engine.handleInput('+');
engine.handleInput('0');
engine.handleInput('.');
engine.handleInput('2');
const addRes = engine.handleInput('=');
assert(addRes.state.displayValue === '0.3', 'Precision addition 0.1 + 0.2 = 0.3');
assert(addRes.historyItem !== undefined, 'Calculation history item generated');
assert(addRes.historyItem.expression === '0.1 + 0.2', 'History expression formatted properly');

// 3. Multiplication & Subtraction
engine.handleInput('AC');
engine.handleInput('6');
engine.handleInput('×');
engine.handleInput('7');
const mulRes = engine.handleInput('=');
assert(mulRes.state.displayValue === '42', 'Multiplication 6 × 7 = 42');

engine.handleInput('−');
engine.handleInput('2');
const subRes = engine.handleInput('=');
assert(subRes.state.displayValue === '40', 'Subtraction chaining 42 − 2 = 40');

// 4. Division & Division by zero
engine.handleInput('AC');
engine.handleInput('8');
engine.handleInput('÷');
engine.handleInput('0');
const divZeroRes = engine.handleInput('=');
assert(divZeroRes.state.displayValue === 'Error', 'Division by zero returns Error');

// 5. Negate +/-
engine.handleInput('AC');
engine.handleInput('4');
engine.handleInput('2');
engine.handleInput('±');
assert(engine.getState().displayValue === '-42', 'Negation: 42 -> -42');
engine.handleInput('±');
assert(engine.getState().displayValue === '42', 'Negation: -42 -> 42');

// 6. Percentage
engine.handleInput('AC');
engine.handleInput('5');
engine.handleInput('0');
engine.handleInput('+');
engine.handleInput('1');
engine.handleInput('0');
engine.handleInput('%');
assert(engine.getState().displayValue === '5', 'Percentage of previous operand: 50 + 10% (=5)');
const pctRes = engine.handleInput('=');
assert(pctRes.state.displayValue === '55', 'Final calculation 50 + 5 = 55');

// 7. Backspace
engine.handleInput('AC');
engine.handleInput('9');
engine.handleInput('8');
engine.handleInput('7');
engine.handleInput('⌫');
assert(engine.getState().displayValue === '98', 'Backspace 987 -> 98');

// 8. ShortcutBuffer rolling trigger detection
console.log('--- Testing ShortcutBuffer ---');
const buffer = new ShortcutBuffer();
const triggers = ['123123123', '456456456', '999'];

for (const ch of '555123123123') {
  buffer.pushChar(ch);
}
assert(buffer.checkTriggers(triggers) === '123123123', 'Shortcut trigger "123123123" detected at end of calculation sequence');

buffer.clear();
for (const ch of '456456456') {
  buffer.pushChar(ch);
}
assert(buffer.checkTriggers(triggers) === '456456456', 'Shortcut trigger "456456456" detected accurately');

console.log('🎉 ALL CALCULATOR & TRIGGER BUFFER TESTS PASSED SUCCESSFULLY!');
