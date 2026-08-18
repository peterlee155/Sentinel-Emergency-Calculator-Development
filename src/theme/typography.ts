import { TextStyle } from 'react-native';

export const typography = {
  // Display & Headers
  displayLarge: {
    fontSize: 56,
    fontWeight: '300',
    letterSpacing: -1,
  } as TextStyle,
  displayMedium: {
    fontSize: 40,
    fontWeight: '400',
    letterSpacing: -0.5,
  } as TextStyle,
  displaySmall: {
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: -0.5,
  } as TextStyle,

  // Calculator Numbers
  calcDisplay: {
    fontSize: 64,
    fontWeight: '300',
    letterSpacing: -1,
  } as TextStyle,
  calcKey: {
    fontSize: 30,
    fontWeight: '400',
    letterSpacing: 0,
  } as TextStyle,
  calcKeyFn: {
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 0,
  } as TextStyle,

  // UI Text
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  } as TextStyle,
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
  caption: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  } as TextStyle,
};
