import { useCallback, useEffect, useRef, useState } from 'react';
import { therapyService } from '../services/therapyService';
import { mapError } from '../../../core/errors';
import type { AppError } from '../../../core/errors';
import type { TherapyMessage } from '../models/therapyContent';

export type TherapyChatStatus = 'loadingHistory' | 'idle' | 'sending' | 'streaming';

/**
 * Per-conversation chat state — mirrors the AI Companion's imperative hook
 * (streaming tokens mutate the last bubble in place), plus emotion tagging and
 * the crisis flag that drives the in-chat Crisis Support banner.
 */
export function useTherapyChat(conversationId: string) {
  const [messages, setMessages] = useState<TherapyMessage[]>([]);
  const [status, setStatus] = useState<TherapyChatStatus>('loadingHistory');
  const [error, setError] = useState<AppError | null>(null);
  const [crisisActive, setCrisisActive] = useState(false);
  const lastFailedText = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    therapyService
      .getMessages(conversationId)
      .then((history) => {
        if (cancelled) return;
        setMessages(history);
        setCrisisActive(history.some((m) => m.emotion === 'crisis'));
        setStatus('idle');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(mapError(err));
        setStatus('idle');
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setError(null);
      lastFailedText.current = null;

      const optimisticUser: TherapyMessage = {
        id: `pending-${Date.now()}`,
        conversationId,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUser]);
      setStatus('sending');

      const streamingId = `streaming-${Date.now()}`;
      let started = false;

      try {
        const result = await therapyService.sendMessage(conversationId, trimmed, {
          onToken: (partial) => {
            if (!started) {
              started = true;
              setStatus('streaming');
              setMessages((prev) => [
                ...prev,
                { id: streamingId, conversationId, role: 'assistant', content: partial, createdAt: new Date().toISOString(), streaming: true },
              ]);
            } else {
              setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, content: partial } : m)));
            }
          },
        });

        setMessages((prev) =>
          prev
            .filter((m) => m.id !== streamingId && m.id !== optimisticUser.id)
            .concat([result.userMessage, result.assistantMessage]),
        );
        if (result.riskDetected) setCrisisActive(true);
        setStatus('idle');
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== streamingId));
        setError(mapError(err));
        lastFailedText.current = trimmed;
        setStatus('idle');
      }
    },
    [conversationId],
  );

  const retry = useCallback(() => {
    const text = lastFailedText.current;
    if (text) {
      setMessages((prev) => prev.filter((m) => !(m.content === text && m.role === 'user')));
      send(text);
    }
  }, [send]);

  return { messages, status, error, crisisActive, send, retry, dismissCrisis: () => setCrisisActive(false) };
}
