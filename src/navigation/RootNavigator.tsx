import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { ShortcutsScreen } from '../screens/ShortcutsScreen';
import { CreateShortcutScreen } from '../screens/CreateShortcutScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { CreateContactScreen } from '../screens/CreateContactScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfilesScreen } from '../screens/ProfilesScreen';
import { CreateProfileScreen } from '../screens/CreateProfileScreen';
import { CamouflageSettingsScreen } from '../screens/CamouflageSettingsScreen';
import { AppDisguiseScreen } from '../screens/AppDisguiseScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { SimulationScreen } from '../screens/SimulationScreen';
import { ActivationScreen } from '../screens/ActivationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Calculator"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Calculator" component={CalculatorScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ShortcutsList" component={ShortcutsScreen} />
        <Stack.Screen name="CreateShortcut" component={CreateShortcutScreen} />
        <Stack.Screen name="ContactsList" component={ContactsScreen} />
        <Stack.Screen name="CreateContact" component={CreateContactScreen} />
        <Stack.Screen name="Profiles" component={ProfilesScreen} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        <Stack.Screen
          name="CamouflageSettings"
          component={CamouflageSettingsScreen}
        />
        <Stack.Screen name="AppDisguise" component={AppDisguiseScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="Subscription" component={PaywallScreen} />
        <Stack.Screen
          name="Simulation"
          component={SimulationScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Activation"
          component={ActivationScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
