import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { RelationshipType } from '../types/contacts';
import contactsService from '../services/contacts/contactsService';
import { Contact, Phone, UserCheck, Trash2 } from 'lucide-react-native';

const RELATIONSHIPS: RelationshipType[] = [
  'Family',
  'Parent',
  'Partner',
  'Child',
  'Friend',
  'Colleague',
  'Doctor',
  'Other',
];

export const CreateContactScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateContact'>>();
  const contactId = route.params?.contactId;

  const { theme, typography, borderRadius } = useTheme();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('Family');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contactId) {
      loadExisting();
    }
  }, [contactId]);

  const loadExisting = async () => {
    if (!contactId) return;
    const contact = await contactsService.getContactById(contactId);
    if (contact) {
      setName(contact.name);
      setPhoneNumber(contact.phoneNumber);
      setRelationship(contact.relationship as RelationshipType);
      setIsPrimary(contact.isPrimary ?? false);
      setNotes(contact.notes ?? '');
    }
  };

  const handleImportNative = async () => {
    try {
      const imported = await contactsService.importNativeContact();
      if (imported) {
        setName(imported.name);
        setPhoneNumber(imported.phoneNumber);
      }
    } catch (e: any) {
      Alert.alert(
        'Permission Notice',
        e.message || 'Unable to import contact from device.'
      );
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a contact name.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Required', 'Please enter a phone number.');
      return;
    }

    try {
      setLoading(true);
      await contactsService.saveContact({
        id: contactId,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        relationship,
        isPrimary,
        notes: notes.trim(),
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Could not save contact.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contactId) return;
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await contactsService.deleteContact(contactId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={contactId ? 'Edit Contact' : 'New Contact'}
        subtitle="Trusted emergency recipient"
        onBack={() => navigation.goBack()}
        rightAction={
          contactId ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Trash2 size={20} color={theme.danger} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Import from Device Contacts Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleImportNative}
          style={[
            styles.importButton,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.surfaceBorder,
              borderRadius: borderRadius.md,
            },
          ]}
        >
          <Contact size={18} color={theme.primary} style={{ marginRight: 8 }} />
          <Text
            style={[
              typography.button,
              { color: theme.primary, fontSize: 14 },
            ]}
          >
            Import from Device Contacts
          </Text>
        </TouchableOpacity>

        {/* Name Field */}
        <Text style={[typography.caption, styles.label, { color: theme.textMuted }]}>
          NAME
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mom, Partner, Doctor Lee"
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              color: theme.text,
              borderRadius: borderRadius.md,
            },
          ]}
        />

        {/* Phone Number Field */}
        <Text style={[typography.caption, styles.label, { color: theme.textMuted }]}>
          PHONE NUMBER
        </Text>
        <View style={styles.phoneInputRow}>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1 555 123 4567"
            placeholderTextColor={theme.textMuted}
            keyboardType="phone-pad"
            style={[
              styles.input,
              styles.phoneInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
                color: theme.text,
                borderRadius: borderRadius.md,
              },
            ]}
          />
        </View>

        {/* Relationship Pills */}
        <Text style={[typography.caption, styles.label, { color: theme.textMuted }]}>
          RELATIONSHIP
        </Text>
        <View style={styles.pillContainer}>
          {RELATIONSHIPS.map((rel) => {
            const isSelected = relationship === rel;
            return (
              <TouchableOpacity
                key={rel}
                onPress={() => setRelationship(rel)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.surfaceElevated,
                    borderColor: isSelected
                      ? theme.primary
                      : theme.surfaceBorder,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.bodySmall,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
                >
                  {rel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary Contact Toggle */}
        <Card style={styles.cardRow}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Primary Contact
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: theme.textSecondary, marginTop: 2 },
                ]}
              >
                First recipient for automated emergency alerts
              </Text>
            </View>
            <Switch
              value={isPrimary}
              onValueChange={setIsPrimary}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>
        </Card>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={loading}
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.primary,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          <Text style={[typography.button, { color: '#FFFFFF' }]}>
            {contactId ? 'Update Contact' : 'Save Emergency Contact'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  phoneInputRow: {
    position: 'relative',
  },
  phoneInput: {
    paddingRight: 40,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  cardRow: {
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  deleteBtn: {
    padding: 4,
  },
});
