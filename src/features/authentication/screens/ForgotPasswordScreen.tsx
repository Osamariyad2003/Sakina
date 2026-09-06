import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, Button, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useForgotPasswordMutation } from '../state/useAuthMutations';
import { buildForgotPasswordSchema, type ForgotPasswordFormValues } from '../validation/schemas';
import type { AppError } from '../../../core/errors';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const mutation = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(buildForgotPasswordSchema(t)),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    mutation.reset();
    mutation.mutate(values);
  };

  if (mutation.isSuccess) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.lg }}>
          <AppText variant="displayMd" style={{ textAlign: 'center' }}>
            {t('auth.resetLinkSentTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('auth.resetLinkSentBody')}
          </AppText>
          <Button
            label={t('common.next')}
            onPress={() => navigation.navigate('ResetPassword', { token: mutation.data?.resetToken })}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="displayMd">{t('auth.forgotPasswordTitle')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {t('auth.forgotPasswordSubtitle')}
          </AppText>

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label={t('auth.emailLabel')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          {mutation.isError ? <ErrorState message={(mutation.error as AppError).message} /> : null}

          <Button label={t('auth.sendResetLink')} onPress={handleSubmit(onSubmit)} loading={mutation.isPending} />
          <Button label={t('common.back')} variant="ghost" onPress={() => navigation.navigate('Login')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
