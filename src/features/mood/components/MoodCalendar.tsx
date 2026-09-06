import React from 'react';
import { View, Pressable, I18nManager } from 'react-native';
import { useTheme } from '../../../ui/theme';
import { AppText } from '../../../ui/primitives';
import { moodLevels } from '../models/moodContent';
import type { MoodEntry } from '../../../types/models';

interface MoodCalendarProps {
  entries: MoodEntry[];
  /** Full year, e.g. 2026. */
  year: number;
  /** 0-11. */
  month: number;
  /** Mon-first weekday labels (length 7), localized by the screen. */
  weekdayLabels: string[];
  onSelectDay?: (entryId: string) => void;
}

/**
 * Month grid for the History "Calendar View" — each day with a check-in
 * shows that mood's emoji. Monday-first; under RTL the columns and weekday
 * headers reverse so the week reads right-to-left.
 */
export function MoodCalendar({ entries, year, month, weekdayLabels, onSelectDay }: MoodCalendarProps) {
  const theme = useTheme();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first offset

  // Latest entry per day-of-month for this month.
  const byDay = new Map<number, MoodEntry>();
  for (const entry of entries) {
    const d = new Date(entry.createdAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay.has(day)) byDay.set(day, entry); // entries are newest-first
    }
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const headers = I18nManager.isRTL ? [...weekdayLabels].reverse() : weekdayLabels;
  const orderRow = (row: (number | null)[]) => (I18nManager.isRTL ? [...row].reverse() : row);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row' }}>
        {headers.map((label, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {label}
            </AppText>
          </View>
        ))}
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {orderRow(row).map((day, ci) => {
            const entry = day != null ? byDay.get(day) : undefined;
            const emoji = entry ? moodLevels.find((m) => m.level === entry.mood)?.emoji : undefined;
            return (
              <Pressable
                key={ci}
                disabled={!entry}
                onPress={() => entry && onSelectDay?.(entry.id)}
                style={{ flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                {day == null ? null : emoji ? (
                  <AppText variant="titleMd">{emoji}</AppText>
                ) : (
                  <AppText variant="caption" color={theme.colors.text.secondary}>
                    {day}
                  </AppText>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
