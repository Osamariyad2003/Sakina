import React, { forwardRef } from 'react';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '../theme';

interface AppBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
}

/** Thin themed wrapper around @gorhom/bottom-sheet — used for pickers, DeleteConfirmation, SafetyBanner detail. */
export const BottomSheet = forwardRef<GorhomBottomSheet, AppBottomSheetProps>(
  ({ children, snapPoints = ['40%'], onClose }, ref) => {
    const theme = useTheme();

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: theme.colors.background.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.border.default }}
        backdropComponent={(props: BottomSheetBackdropProps) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
        )}
      >
        <BottomSheetView style={{ padding: theme.spacing.md }}>{children}</BottomSheetView>
      </GorhomBottomSheet>
    );
  },
);
BottomSheet.displayName = 'BottomSheet';
