import React from 'react';
import { Modal as RNModal, View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Simple centered modal for confirmations/dialogs. For sheets, use BottomSheet. */
export function AppModal({ visible, onClose, children }: AppModalProps) {
  const theme = useTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="إغلاق"
      />
      <View style={styles.centerWrap}>
        <View
          style={{
            backgroundColor: theme.colors.background.surface,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            width: '86%',
            ...theme.shadows.lg,
          }}
        >
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  // box-none: the backdrop behind stays tappable, the dialog itself doesn't.
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', pointerEvents: 'box-none' },
});
