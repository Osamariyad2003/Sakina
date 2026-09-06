import { useCallback, useEffect, useRef, useState } from 'react';
import { companionService } from '../services/companionService';
import { mapError } from '../../../core/errors';
import type { AppError } from '../../../core/errors';
import type { ChatMessage } from '../../../types/models';

export type ChatStatus = 'idle' | 'loadingHistory' | 'sending' | 'streaming';

/**
 * Imperative chat state (spec §16 States: Empty/Sending/AI Thinking/
 * Streaming/Success/Failed Message/Network Error/Retry) — a plain hook
 * rather than TanStack Query, since streaming tokens need to mutate the
 * last bubble in place rather than refetch a query.
 */
export function useCompanionChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('loadingHistory');
  const [error, setError] = useState<AppError | null>(null);
  const [riskDetected, setRiskDetected] = useState(false);
  const [suggestion, setSuggestion] = useState<'stressManagement' | undefined>(undefined);
  const lastFailedText = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    companionService
      .getMessages()
      .then((history) => {
        if (!cancelled) {
          setMessages(history);
          setStatus('idle');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(mapError(err));
          setStatus('idle');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    lastFailedText.current = null;

    const optimisticUserMessage: ChatMessage = {
      id: `pending-${Date.now()}`,
      conversationId: 'default',
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setStatus('sending');

    const streamingId = `streaming-${Date.now()}`;
    let streamingStarted = false;

    try {
      const result = await companionService.sendMessage(trimmed, {
        onToken: (partial) => {
          if (!streamingStarted) {
            streamingStarted = true;
            setStatus('streaming');
            setMessages((prev) => [
              ...prev,
              {
                id: streamingId,
                conversationId: 'default',
                role: 'assistant',
                content: partial,
                createdAt: new Date().toISOString(),
                streaming: true,
              },
            ]);
          } else {
            setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, content: partial } : m)));
          }
        },
      });

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== streamingId && m.id !== optimisticUserMessage.id)
          .concat([result.userMessage, result.assistantMessage]),
      );
      setRiskDetected(result.riskDetected);
      setSuggestion(result.suggestion);
      setStatus('idle');
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== streamingId));
      setError(mapError(err));
      lastFailedText.current = trimmed;
      setStatus('idle');
    }
  }, []);

  const retry = useCallback(() => {
    const text = lastFailedText.current;
    if (text) {
      setMessages((prev) => prev.filter((m) => m.content !== text || m.role !== 'user'));
      send(text);
    }
  }, [send]);

  return { messages, status, error, riskDetected, suggestion, send, retry, canRetry: Boolean(lastFailedText.current) };
}
