import React, { useRef } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText, Button, IconButton } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { CompanionAvatar, type CompanionAvatarHandle } from '../../../companion/CompanionAvatar';
import { useVoiceLoop } from '../../../companion/useVoiceLoop';

const AVATAR_SIZE = 160;

interface CompanionVoicePanelProps {
  /** Runs once when the voice loop escalates — caller navigates to the Safety screen. */
  onCrisis: () => void;
}

/**
 * Mounted above the conversation list on `ConversationScreen`. Owns the
 * avatar + mic button + status hint for the voice turn; the crisis "recede
 * and hand off" panel replaces the mic entirely once triggered and stays up
 * until the user explicitly taps back in (no auto-return — see `useVoiceLoop`).
 */
export function CompanionVoicePanel({ onCrisis }: CompanionVoicePanelProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const avatarRef = useRef<CompanionAvatarHandle>(null);

  const { start, stop, status, transcript, error, reset } = useVoiceLoop({
    avatarRef,
    onCrisis,
  });

  const isCrisis = status === 'crisis';
  const isBusy = status === 'listening' || status === 'speaking';

  const micLabel =
    status === 'listening'
      ? t('companion.voice.micListeningLabel')
      : status === 'speaking'
        ? t('companion.voice.micSpeakingLabel')
        : status === 'reflecting'
          ? t('companion.voice.micReflectingLabel')
          : t('companion.voice.micIdleLabel');

  const hint =
    status === 'listening'
      ? t('companion.voice.listeningHint')
      : status === 'reflecting'
        ? t('companion.voice.reflectingHint')
        : status === 'speaking'
          ? t('companion.voice.speakingHint')
          : null;

  const handleMicPress = () => {
    if (status === 'listening' || status === 'speaking') {
      stop();
    } else if (status === 'idle') {
      void start();
    }
  };

  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.spacing.md, gap: theme.spacing.xs }}>
      <CompanionAvatar ref={avatarRef} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />

      {isCrisis ? (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.background.surface,
          }}
        >
          <AppText variant="titleMd" style={{ textAlign: 'center' }}>
            {t('companion.crisis.recededTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('companion.crisis.recededBody')}
          </AppText>
          {/* Primary way out of this state is a human, not the companion —
              the avatar has already receded behind it (see the design sheet). */}
          <Button label={t('companion.crisis.reachHumanCta')} onPress={onCrisis} />
          <Button label={t('companion.crisis.returnCta')} variant="secondary" onPress={reset} />
        </View>
      ) : (
        <>
          <IconButton
            accessibilityLabel={micLabel}
            variant="filled"
            onPress={handleMicPress}
            icon={
              <Ionicons
                name={status === 'listening' ? 'mic' : status === 'speaking' ? 'volume-high' : 'mic-outline'}
                size={28}
                color={isBusy ? theme.colors.status.error : theme.colors.brand.primary}
              />
            }
          />
          {hint ? (
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {hint}
            </AppText>
          ) : null}
          {status === 'listening' && transcript ? (
            <AppText variant="body" style={{ textAlign: 'center' }}>
              {transcript}
            </AppText>
          ) : null}
          {error ? (
            <AppText variant="caption" color={theme.colors.status.error} style={{ textAlign: 'center' }}>
              {error === 'permission_denied'
                ? t('companion.voice.permissionDenied')
                : error === 'speech_recognition_unavailable'
                  ? t('companion.voice.unavailable')
                  : t('companion.voice.error')}
            </AppText>
          ) : null}
        </>
      )}
    </View>
  );
}
