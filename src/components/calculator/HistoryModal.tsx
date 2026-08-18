import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../theme';
import { CalculationHistoryItem } from '../../types/calculator';
import { Trash2, X, Clock } from 'lucide-react-native';

interface HistoryModalProps {
  visible: boolean;
  history: CalculationHistoryItem[];
  onClose: () => void;
  onSelectResult: (result: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  visible,
  history,
  onClose,
  onSelectResult,
  onClearHistory,
}) => {
  const { theme, typography, borderRadius } = useTheme();

  const renderItem = ({ item }: { item: CalculationHistoryItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          onSelectResult(item.result);
          onClose();
        }}
        style={[
          styles.historyCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.surfaceBorder,
            borderRadius: borderRadius.md,
          },
        ]}
      >
        <Text
          style={[typography.bodyMedium, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {item.expression} =
        </Text>
        <Text style={[typography.h2, { color: theme.text, marginTop: 4 }]}>
          {item.result}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: theme.divider, backgroundColor: theme.surface },
          ]}
        >
          <View style={styles.titleRow}>
            <Clock size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[typography.h3, { color: theme.text }]}>
              Calculation History
            </Text>
          </View>
          <View style={styles.actionRow}>
            {history.length > 0 && (
              <TouchableOpacity
                onPress={onClearHistory}
                style={styles.iconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={20} color={theme.danger} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              style={[styles.iconBtn, { marginLeft: 16 }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* List of History */}
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text
              style={[
                typography.bodyLarge,
                { color: theme.textMuted, textAlign: 'center' },
              ]}
            >
              No calculations yet
            </Text>
            <Text
              style={[
                typography.bodySmall,
                { color: theme.textMuted, textAlign: 'center', marginTop: 6 },
              ]}
            >
              Your past calculation results will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  historyCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
