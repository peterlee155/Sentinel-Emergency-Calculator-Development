module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-sms$': '<rootDir>/__mocks__/expo-sms.js',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.js',
    '^expo-contacts$': '<rootDir>/__mocks__/expo-contacts.js',
    '^expo-local-authentication$':
      '<rootDir>/__mocks__/expo-local-authentication.js',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    '^react-native-purchases$': '<rootDir>/__mocks__/react-native-purchases.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
