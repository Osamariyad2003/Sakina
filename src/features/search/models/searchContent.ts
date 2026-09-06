/**
 * Global search (SH Freud reference: the Home search bar and the dedicated
 * "Search Screen" section).
 *
 * Search spans two very different things — the user's own private content
 * (journal, mood notes) and the app's public catalogues (articles, exercises,
 * therapists, help, community). They are kept as distinct `kind`s and grouped
 * separately in the UI so a private journal line can never be mistaken for
 * public content, and so the user can scope a search to "mine" only.
 */

export type SearchResultKind =
  | 'journal'
  | 'mood'
  | 'article'
  | 'workshop'
  | 'exercise'
  | 'therapist'
  | 'help'
  | 'communityThread';

/** Which group a kind belongs to — drives the scope chips and the section headings. */
export type SearchScope = 'all' | 'mine' | 'learn' | 'support';

export const scopeForKind: Record<SearchResultKind, Exclude<SearchScope, 'all'>> = {
  journal: 'mine',
  mood: 'mine',
  article: 'learn',
  workshop: 'learn',
  exercise: 'learn',
  therapist: 'support',
  help: 'support',
  communityThread: 'support',
};

export const kindMeta: Record<
  SearchResultKind,
  { icon: 'book-outline' | 'happy-outline' | 'document-text-outline' | 'school-outline' | 'leaf-outline' | 'person-outline' | 'help-circle-outline' | 'chatbubbles-outline' }
> = {
  journal: { icon: 'book-outline' },
  mood: { icon: 'happy-outline' },
  article: { icon: 'document-text-outline' },
  workshop: { icon: 'school-outline' },
  exercise: { icon: 'leaf-outline' },
  therapist: { icon: 'person-outline' },
  help: { icon: 'help-circle-outline' },
  communityThread: { icon: 'chatbubbles-outline' },
};

export interface SearchResult {
  /** Unique across kinds: `${kind}:${entityId}`. */
  key: string;
  kind: SearchResultKind;
  /** The entity's own id, used to navigate. */
  entityId: string;
  title: string;
  subtitle?: string;
  /** Only set for the user's own dated content. */
  createdAt?: string;
}

export const MIN_QUERY_LENGTH = 2;
export const MAX_RECENT_SEARCHES = 8;

/** Case-insensitive contains, tolerant of undefined fields. */
export function matches(needle: string, ...fields: (string | undefined)[]): boolean {
  const q = needle.trim().toLowerCase();
  if (!q) return false;
  return fields.some((field) => field?.toLowerCase().includes(q));
}

/** Trims a long body down to a one-line preview around nothing in particular. */
export function preview(text: string, length = 120): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= length ? clean : `${clean.slice(0, length)}…`;
}
