import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, TextArea, Button, ErrorState, SkeletonList } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { JournalPrompt } from '../components/JournalPrompt';
import { AIReflectionCard } from '../components/AIReflectionCard';
import {
  useJournalEntryQuery,
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useDeleteJournalMutation,
} from '../state/useJournalQueries';
import { useJournalDraft } from '../state/useJournalDraft';
import { buildJournalEntrySchema } from '../validation/schemas';
import type { JournalStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalEntry'>;

/** Create/View/Edit/Delete (spec §17) with guided prompts and local draft autosave. */
export function JournalEntryScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const entryId = route.params?.entryId;
  const isEditing = Boolean(entryId);

  const entryQuery = useJournalEntryQuery(entryId);
  const createMutation = useCreateJournalMutation();
  const updateMutation = useUpdateJournalMutation();
  const deleteMutation = useDeleteJournalMutation();
  const draft = useJournalDraft(entryId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [promptId, setPromptId] = useState<string | undefined>(undefined);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from the existing entry (edit) or a saved draft (new/resume) exactly once.
  useEffect(() => {
    if (hydrated) return;
    if (isEditing) {
      if (entryQuery.data) {
        setTitle(entryQuery.data.title ?? '');
        setContent(entryQuery.data.content);
        setPromptId(entryQuery.data.promptId);
        setHydrated(true);
      }
    } else {
      const saved = draft.loadDraft();
      if (saved) {
        setTitle(saved.title ?? '');
        setContent(saved.content);
        setPromptId(saved.promptId);
      }
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, entryQuery.data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    draft.saveDraft({ title, content, promptId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, promptId, hydrated]);

  const selectPrompt = (id: string, text: string) => {
    setPromptId(id);
    if (!content.trim()) setContent(text + '\n');
  };

  const save = () => {
    const result = buildJournalEntrySchema(t).safeParse({ title: title || undefined, content, promptId });
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? t('errors.validation'));
      return;
    }
    setValidationError(null);

    const input = { title: result.data.title, content: result.data.content, promptId: result.data.promptId };
    const onSuccess = () => {
      draft.clearDraft();
      navigation.goBack();
    };

    if (isEditing && entryId) {
      updateMutation.mutate({ id: entryId, input }, { onSuccess });
    } else {
      createMutation.mutate(input, { onSuccess });
    }
  };

  const confirmDelete = () => {
    if (!entryId) return;
    Alert.alert(t('journal.deleteConfirmTitle'), t('journal.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('journal.deleteConfirmCta'),
        style: 'destructive',
        onPress: () => deleteMutation.mutate(entryId, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  };

  const mutation = isEditing ? updateMutation : createMutation;

  if (isEditing && entryQuery.isLoading) {
    return (
      <Screen>
        <SkeletonList rows={3} />
      </Screen>
    );
  }

  if (isEditing && entryQuery.isError) {
    return (
      <Screen>
        <ErrorState message={errorText(entryQuery.error, t)} onRetry={() => entryQuery.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingTop: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl }}>
          {!isEditing ? <JournalPrompt selectedId={promptId} onSelect={selectPrompt} /> : null}

          <TextField placeholder={t('journal.titlePlaceholder')} value={title} onChangeText={setTitle} />
          <TextArea
            placeholder={t('journal.contentPlaceholder')}
            value={content}
            onChangeText={setContent}
            minLines={8}
            maxLength={5000}
          />

          {isEditing && entryQuery.data ? <AIReflectionCard entry={entryQuery.data} /> : null}

          {validationError ? <ErrorState message={validationError} /> : null}
          {mutation.isError ? <ErrorState message={errorText(mutation.error, t)} /> : null}

          <Button label={t('common.save')} onPress={save} loading={mutation.isPending} />
          {isEditing ? (
            <Button label={t('journal.deleteConfirmCta')} variant="destructive" onPress={confirmDelete} loading={deleteMutation.isPending} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
