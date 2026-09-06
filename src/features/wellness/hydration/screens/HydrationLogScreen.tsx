import React, { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import type GorhomBottomSheet from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, BottomSheet } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { drinkSizeOptions, type DrinkSizeOption } from '../models/hydrationContent';
import { useLogDrinkMutation } from '../state/useHydrationQueries';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'HydrationLog'>;

/**
 * Structure: reference's "drink-size chooser (carousel) + quick 'hydrate?'
 * confirm sheet," combined into one screen — a horizontally-paged size
 * picker, then a `BottomSheet` confirm step (reusing the primitive already
 * proven working elsewhere this session, with its known web open/close
 * quirk already documented in ASSUMPTIONS.md — not new risk here).
 * Styling: theme.spacing/theme.colors + our extended `accent.hydration`
 * token + Screen/AppText/Card/Button/BottomSheet — no reference values.
 */
export function HydrationLogScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const [selected, setSelected] = useState<DrinkSizeOption | null>(null);
  const logDrink = useLogDrinkMutation();

  const chooseSize = (option: DrinkSizeOption) => {
    setSelected(option);
    sheetRef.current?.expand();
  };

  const confirm = () => {
    if (!selected) return;
    logDrink.mutate(selected.ml, { onSuccess: () => navigation.goBack() });
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('hydration.logTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('hydration.logSubtitle')}
        </AppText>

        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
          {drinkSizeOptions.map((option) => (
            <Card key={option.key} onPress={() => chooseSize(option)} style={{ width: 140, alignItems: 'center', gap: theme.spacing.xs }}>
              <AppText variant="titleMd">{isArabic ? option.labelAr : option.labelEn}</AppText>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {t('hydration.mlValue', { count: option.ml })}
              </AppText>
            </Card>
          ))}
        </ScrollView>
      </View>

      <BottomSheet ref={sheetRef} snapPoints={['30%']}>
        <AppText variant="titleMd">
          {selected ? t('hydration.confirmPrompt', { size: isArabic ? selected.labelAr : selected.labelEn, ml: selected.ml }) : ''}
        </AppText>
        <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.md }}>
          <Button label={t('hydration.confirmCta')} onPress={confirm} loading={logDrink.isPending} />
          <Button label={t('common.cancel')} variant="ghost" onPress={() => sheetRef.current?.close()} />
        </View>
      </BottomSheet>
    </Screen>
  );
}
