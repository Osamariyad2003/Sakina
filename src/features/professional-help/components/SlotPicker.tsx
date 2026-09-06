import React from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { AppText, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useAppointmentFormat } from './useAppointmentFormat';
import type { AvailabilitySlot } from '../models/professionalContent';
import type { AppError } from '../../../core/errors';

interface SlotPickerProps {
  slots: AvailabilitySlot[] | undefined;
  isLoading: boolean;
  error: AppError | null;
  onRetry: () => void;
  selected: string | null;
  onSelect: (startsAt: string) => void;
}

/**
 * The time grid for one day. Unavailable slots stay visible but disabled
 * rather than being hidden, so the day never looks emptier than it is.
 */
export function SlotPicker({ slots, isLoading, error, onRetry, selected, onSelect }: SlotPickerProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatTime } = useAppointmentFormat();

  if (isLoading) return <SkeletonList rows={3} />;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (!slots || slots.every((s) => !s.available)) {
    return <EmptyState title={t('professionals.noSlotsTitle')} description={t('professionals.noSlotsBody')} />;
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
      {slots.map((slot) => {
        const isSelected = slot.startsAt === selected;
        return (
          <Pressable
            key={slot.startsAt}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: !slot.available }}
            accessibilityLabel={formatTime(slot.startsAt)}
            disabled={!slot.available}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onSelect(slot.startsAt);
            }}
            style={({ pressed }) => ({
              minHeight: theme.sizes.controlHeight,
              minWidth: 84,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: theme.spacing.sm,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: isSelected ? theme.colors.brand.primary : theme.colors.border.default,
              backgroundColor: isSelected ? theme.colors.brand.primary : theme.colors.background.surface,
              opacity: !slot.available ? 0.4 : pressed ? 0.85 : 1,
            })}
          >
            <AppText variant="label" color={isSelected ? theme.colors.text.onBrand : theme.colors.text.primary}>
              {formatTime(slot.startsAt)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
