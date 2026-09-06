import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, Button, ErrorState } from '../../../ui/primitives';
import { PasswordField } from '../components/PasswordField';
import { useTheme } from '../../../ui/theme';
import { useRegisterMutation } from '../state/useAuthMutations';
import { buildRegisterSchema, type RegisterFormValues } from '../validation/schemas';
import type { AppError } from '../../../core/errors';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const mutation = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(buildRegisterSchema(t)),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = (values: RegisterFormValues) => {
    mutation.reset();
    mutation.mutate(values);
  };

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
          <AppText variant="displayMd">{t('auth.registerTitle')}</AppText>

          <Controller
            control={control}
            name="displayName"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label={t('auth.nameLabel')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.displayName?.message}
                returnKeyType="next"
              />
            )}
          />

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
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <PasswordField
                label={t('auth.passwordLabel')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
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

          {mutation.isError ? <ErrorState message={(mutation.error as AppError).message} /> : null}

          <Button label={t('auth.registerButton')} onPress={handleSubmit(onSubmit)} loading={mutation.isPending} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xxs }}>
            <AppText variant="body" color={theme.colors.text.secondary}>
              {t('auth.haveAccount')}
            </AppText>
            <Button label={t('auth.loginTitle')} variant="ghost" size="md" onPress={() => navigation.navigate('Login')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
