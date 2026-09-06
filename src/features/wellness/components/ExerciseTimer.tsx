import React from 'react';
import { AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface ExerciseTimerProps {
  remainingSeconds: number;
}

export function ExerciseTimer({ remainingSeconds }: ExerciseTimerProps) {
  const theme = useTheme();
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <AppText variant="displayMd" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
      {label}
    </AppText>
  );
}
