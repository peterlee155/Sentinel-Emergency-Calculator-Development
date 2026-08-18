import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmergencyContact } from '../types/contacts';
import contactsService from '../services/contacts/contactsService';
import { Users, Phone, Plus, ChevronRight, Star } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { theme, typography, borderRadius } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    if (isFocused) {
      loadContacts();
    }
  }, [isFocused]);

  const loadContacts = async () => {
    const list = await contactsService.getAllContacts();
    setContacts(list);
  };

  const renderItem = ({ item }: { item: EmergencyContact }) => {
    return (
      <Card
        onPress={() =>
          navigation.navigate('CreateContact', { contactId: item.id })
        }
        style={styles.card}
      >
        <View style={styles.row}>
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={[typography.h3, { color: theme.text }]}>
                {item.name}
              </Text>
              {item.isPrimary && (
                <View style={styles.primaryBadgeWrapper}>
                  <Badge label="PRIMARY" variant="primary" />
                </View>
              )}
            </View>
            <Text
              style={[
                typography.bodyMedium,
                { color: theme.textSecondary, marginTop: 4 },
              ]}
            >
              {item.phoneNumber} • {item.relationship}
            </Text>
          </View>
          <ChevronRight size={18} color={theme.textMuted} />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Emergency Contacts"
        subtitle="Recipients for calls and SMS alerts"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateContact', undefined)}
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.surfaceElevated },
            ]}
          >
            <Users size={32} color={theme.textMuted} />
          </View>
          <Text
            style={[
              typography.h3,
              { color: theme.text, marginTop: 16, textAlign: 'center' },
            ]}
          >
            No Contacts Added
          </Text>
          <Text
            style={[
              typography.bodyMedium,
              { color: theme.textSecondary, textAlign: 'center', marginTop: 8 },
            ]}
          >
            Add emergency contacts who will be notified when your calculator
            triggers are activated.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateContact', undefined)}
            style={[
              styles.emptyButton,
              {
                backgroundColor: theme.primary,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <Plus size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={[typography.button, { color: '#FFFFFF' }]}>
              Add First Contact
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 20,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryBadgeWrapper: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 24,
  },
});
