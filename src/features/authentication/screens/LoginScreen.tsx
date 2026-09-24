import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, Button, ErrorState } from '../../../ui/primitives';
import { PasswordField } from '../components/PasswordField';
import { useTheme } from '../../../ui/theme';
import { useLoginMutation } from '../state/useAuthMutations';
import { buildLoginSchema, type LoginFormValues } from '../validation/schemas';
import type { AuthStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const mutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(buildLoginSchema(t)),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
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
          <AppText variant="displayMd">{t('auth.loginTitle')}</AppText>

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
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <View style={{ alignItems: 'flex-end' }}>
            <Button
              label={t('auth.forgotPasswordLink')}
              variant="ghost"
              size="md"
              onPress={() => navigation.navigate('ForgotPassword')}
            />
          </View>

          {mutation.isError ? <ErrorState message={errorText(mutation.error, t)} /> : null}

          <Button
            label={t('auth.loginButton')}
            onPress={handleSubmit(onSubmit)}
            loading={mutation.isPending}
            accessibilityHint={t('auth.loginTitle')}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xxs }}>
            <AppText variant="body" color={theme.colors.text.secondary}>
              {t('auth.noAccount')}
            </AppText>
            <Button label={t('auth.createOne')} variant="ghost" size="md" onPress={() => navigation.navigate('Register')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
