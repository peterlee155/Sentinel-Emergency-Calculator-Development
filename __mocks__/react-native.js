const Platform = {
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
};

const Linking = {
  canOpenURL: jest.fn().mockResolvedValue(true),
  openURL: jest.fn().mockResolvedValue(true),
};

const Alert = {
  alert: jest.fn(),
};

const StyleSheet = {
  create: (styles) => styles,
};

module.exports = {
  Platform,
  Linking,
  Alert,
  StyleSheet,
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  Modal: 'Modal',
  Switch: 'Switch',
  SafeAreaView: 'SafeAreaView',
  StatusBar: 'StatusBar',
  ActivityIndicator: 'ActivityIndicator',
  useColorScheme: () => 'dark',
};
