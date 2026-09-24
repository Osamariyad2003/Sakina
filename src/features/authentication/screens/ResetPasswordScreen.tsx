import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, ErrorState } from '../../../ui/primitives';
import { PasswordField } from '../components/PasswordField';
import { useTheme } from '../../../ui/theme';
import { useResetPasswordMutation } from '../state/useAuthMutations';
import { buildResetPasswordSchema, type ResetPasswordFormValues } from '../validation/schemas';
import type { AuthStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const mutation = useResetPasswordMutation();
  const token = route.params?.token;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(buildResetPasswordSchema(t)),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!token) return;
    mutation.reset();
    mutation.mutate({ token, newPassword: values.newPassword });
  };

  if (mutation.isSuccess) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.lg }}>
          <AppText variant="displayMd" style={{ textAlign: 'center' }}>
            {t('auth.resetSuccessTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('auth.resetSuccessBody')}
          </AppText>
          <Button label={t('auth.loginTitle')} onPress={() => navigation.navigate('Login')} />
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
          <AppText variant="displayMd">{t('auth.resetPasswordTitle')}</AppText>

          {!token ? (
            <ErrorState message={t('auth.invalidResetToken')} onRetry={() => navigation.navigate('ForgotPassword')} />
          ) : (
            <>
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { value, onChange, onBlur } }) => (
                  <PasswordField
                    label={t('auth.newPasswordLabel')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.newPassword?.message}
                    returnKeyType="next"
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { value, onChange, onBlur } }) => (
                  <PasswordField
                    label={t('auth.confirmPasswordLabel')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />

              {mutation.isError ? <ErrorState message={errorText(mutation.error, t)} /> : null}

              <Button label={t('auth.resetPasswordButton')} onPress={handleSubmit(onSubmit)} loading={mutation.isPending} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
