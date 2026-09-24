import { storage, storageKeys } from '../../../../core/storage/mmkv';
import { parseContract } from '../../../../core/api';
import { simulateLatency } from '../../../../core/async/simulateLatency';
import { apiClient, fetchAllPages, unwrap, type ApiSuccess } from '../../../../core/api';
import { config } from '../../../../config';
import {
  optimalSleepMinutes,
  minimalSleepMinutes,
  SleepRecordSchema,
  type SleepRecord,
  type SleepSchedule,
  type SleepScheduleDraft,
} from '../models/sleepContent';

/**
 * [ASSUMPTION] No backend exists yet (product-definition.md Open Question
 * #4) — same mock pattern as journal/mood/stress/hydration services: MMKV
 * persistence, `fakeDelay` to exercise real loading states, and a loud
 * failure if `config.useMockServices` is ever flipped without a real
 * implementation. Records seed once with a few sample nights so the
 * dashboard/history/summary screens have real data to render on first run;
 * schedules start empty (the user creates them through the flow).
 */


// --- Schedules (a real local preference, not mock data) --------------------

function readSchedules(): SleepSchedule[] {
  return storage.getJSON<SleepSchedule[]>(storageKeys.sleepSchedules) ?? [];
}

function writeSchedules(schedules: SleepSchedule[]) {
  storage.setJSON(storageKeys.sleepSchedules, schedules);
}

async function listSchedules(): Promise<SleepSchedule[]> {
  await simulateLatency(150);
  return readSchedules();
}

async function createSchedule(draft: SleepScheduleDraft): Promise<SleepSchedule> {
  await simulateLatency(200);
  const schedule: SleepSchedule = {
    id: `sleep-schedule-${Date.now()}`,
    bedtime: draft.bedtime,
    wakeTime: draft.wakeTime,
    activeDays: draft.activeDays,
    enabled: true,
    autoAlarm: draft.autoAlarm,
    soundEnabled: draft.soundEnabled,
    snoozeEnabled: draft.snoozeEnabled,
    createdAt: new Date().toISOString(),
  };
  writeSchedules([schedule, ...readSchedules()]);
  return schedule;
}

async function setScheduleEnabled(id: string, enabled: boolean): Promise<SleepSchedule[]> {
  await simulateLatency(120);
  const next = readSchedules().map((s) => (s.id === id ? { ...s, enabled } : s));
  writeSchedules(next);
  return next;
}

// --- Records (mock, seeded) ------------------------------------------------

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function seedRecords(): SleepRecord[] {
  return [
    {
      id: 'sleep-seed-1',
      date: isoDaysAgo(1),
      durationMinutes: 8 * 60 + 15,
      rating: 'normal',
      stages: { deep: 128, core: 296, rem: 47, awake: 24 },
      bedtime: '00:12',
      wakeTime: '08:27',
      scoreImpact: 3,
      suggestionIds: [],
    },
    {
      id: 'sleep-seed-2',
      date: isoDaysAgo(2),
      durationMinutes: 4 * 60 + 12,
      rating: 'irregular',
      stages: { deep: 44, core: 168, rem: 20, awake: 20 },
      bedtime: '01:40',
      wakeTime: '05:52',
      scoreImpact: -2,
      suggestionIds: ['limit-screens', 'optimize-environment'],
    },
    {
      id: 'sleep-seed-3',
      date: isoDaysAgo(3),
      durationMinutes: 1 * 60 + 12,
      rating: 'insomniac',
      stages: { deep: 8, core: 40, rem: 6, awake: 18 },
      bedtime: '02:55',
      wakeTime: '04:07',
      scoreImpact: -3,
      suggestionIds: ['relaxing-routine'],
    },
    {
      id: 'sleep-seed-4',
      date: isoDaysAgo(4),
      durationMinutes: 7 * 60 + 20,
      rating: 'core',
      stages: { deep: 96, core: 288, rem: 40, awake: 16 },
      bedtime: '23:30',
      wakeTime: '06:50',
      scoreImpact: 2,
      suggestionIds: [],
    },
    {
      id: 'sleep-seed-5',
      date: isoDaysAgo(5),
      durationMinutes: 2 * 60 + 10,
      rating: 'rem',
      stages: { deep: 18, core: 78, rem: 26, awake: 8 },
      bedtime: '03:10',
      wakeTime: '05:20',
      scoreImpact: -1,
      suggestionIds: ['optimize-environment'],
    },
  ];
}

function readRecords(): SleepRecord[] {
  const stored = storage.getJSON<SleepRecord[]>(storageKeys.mockSleepRecords);
  if (stored) return stored;
  const seeded = seedRecords();
  storage.setJSON(storageKeys.mockSleepRecords, seeded);
  return seeded;
}

function writeRecords(records: SleepRecord[]) {
  storage.setJSON(storageKeys.mockSleepRecords, records);
}

async function listRecords(): Promise<SleepRecord[]> {
  await simulateLatency();
  return readRecords();
}

async function getRecord(id: string): Promise<SleepRecord | undefined> {
  await simulateLatency(120);
  return readRecords().find((r) => r.id === id);
}

async function deleteRecord(id: string): Promise<SleepRecord[]> {
  await simulateLatency(150);
  const next = readRecords().filter((r) => r.id !== id);
  writeRecords(next);
  return next;
}

export interface CreateSleepRecordInput {
  durationMinutes: number;
  bedtime: string;
  wakeTime: string;
}

/**
 * Turns a completed sleep session into a recorded night. Stage split + rating
 * are derived from the duration with a light, deterministic model (no real
 * sensor data exists — see the file header assumption).
 */
/**
 * The rating, stage split, score impact and suggestions are illustrative
 * values derived from the duration alone — the same rules the mock has always
 * used. Neither the mock nor the backend measures sleep stages.
 */
function deriveRecord(id: string, date: string, input: CreateSleepRecordInput): SleepRecord {
  const { durationMinutes } = input;
  const awake = Math.round(durationMinutes * 0.06);
  const asleep = Math.max(0, durationMinutes - awake);
  return {
    id,
    date,
    durationMinutes,
    rating:
      durationMinutes >= optimalSleepMinutes
        ? 'normal'
        : durationMinutes >= minimalSleepMinutes
          ? 'core'
          : durationMinutes >= 3 * 60
            ? 'irregular'
            : 'insomniac',
    stages: {
      deep: Math.round(asleep * 0.22),
      core: Math.round(asleep * 0.58),
      rem: Math.round(asleep * 0.2),
      awake,
    },
    bedtime: input.bedtime,
    wakeTime: input.wakeTime,
    scoreImpact: durationMinutes >= minimalSleepMinutes ? 3 : durationMinutes >= 3 * 60 ? -1 : -3,
    suggestionIds: durationMinutes >= minimalSleepMinutes ? [] : ['optimize-environment', 'limit-screens'],
  };
}

async function createRecord(input: CreateSleepRecordInput): Promise<SleepRecord> {
  await simulateLatency(200);
  const record = deriveRecord(`sleep-record-${Date.now()}`, new Date().toISOString().slice(0, 10), input);
  writeRecords([record, ...readRecords()]);
  return record;
}

// --- AI recommendation -----------------------------------------------------

export interface SleepRecommendation {
  /** Recommended total sleep, minutes. */
  optimalMinutes: number;
  /** Minimum acceptable sleep, minutes. */
  minimalMinutes: number;
  /** Suggested bed/wake derived from the questionnaire answers. */
  bedtime: string;
  wakeTime: string;
}

/**
 * Derives a recommendation from the two questionnaire anchors: keep the
 * user's stated wake time, and back-calculate a bedtime that reaches the
 * optimal target (nudging their stated in-bed time toward it).
 */
async function recommend(answers: { wakeUp: string; inBed: string }): Promise<SleepRecommendation> {
  await simulateLatency(900); // "Compiling data…"
  const [wh, wm] = answers.wakeUp.split(':').map((n) => parseInt(n, 10));
  const wakeMinutes = wh * 60 + wm;
  const bedMinutes = ((wakeMinutes - optimalSleepMinutes) % 1440 + 1440) % 1440;
  const toClock = (t: number) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  return {
    optimalMinutes: optimalSleepMinutes,
    minimalMinutes: minimalSleepMinutes,
    bedtime: toClock(bedMinutes),
    wakeTime: answers.wakeUp,
  };
}

// --- Real backend (config.useMockServices false) ----------------------------
// /sleep: POST { bedTime, wakeTime } · GET (paginated, newest first) ·
// DELETE /:id (no get-by-id). The backend stores full timestamps; the app
// works in "HH:MM" + duration, so:
//   - saving: wake = today at `wakeTime`, bed = wake − duration
//   - reading: HH:MM and duration come from the two timestamps, `date` is the
//     wake-up day, and the derived fields go through `deriveRecord`.
// Schedules and the recommendation are local (no backend counterpart).

interface ApiSleepRecord {
  id: string;
  bedTime: string;
  wakeTime: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toClock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const toLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function fromApiRecord(record: ApiSleepRecord): SleepRecord {
  const bed = new Date(record.bedTime);
  const wake = new Date(record.wakeTime);
  const durationMinutes = Math.max(0, Math.round((wake.getTime() - bed.getTime()) / 60000));
  // `deriveRecord` fills in the derived fields (rating, stages, score), so the
  // contract check runs on the finished domain object.
  return parseContract(
    SleepRecordSchema,
    deriveRecord(record.id, toLocalDate(wake), {
      durationMinutes,
      bedtime: toClock(bed),
      wakeTime: toClock(wake),
    }),
    'GET /sleep',
  );
}

async function liveListRecords(): Promise<SleepRecord[]> {
  return (await fetchAllPages<ApiSleepRecord>('/sleep')).map(fromApiRecord);
}

async function liveGetRecord(id: string): Promise<SleepRecord | undefined> {
  return (await liveListRecords()).find((r) => r.id === id);
}

async function liveDeleteRecord(id: string): Promise<SleepRecord[]> {
  await apiClient.delete(`/sleep/${id}`);
  return liveListRecords();
}

async function liveCreateRecord(input: CreateSleepRecordInput): Promise<SleepRecord> {
  const [hours, minutes] = input.wakeTime.split(':').map((n) => parseInt(n, 10));
  const wake = new Date();
  wake.setHours(hours, minutes, 0, 0);
  const bed = new Date(wake.getTime() - input.durationMinutes * 60000);
  const body = { bedTime: bed.toISOString(), wakeTime: wake.toISOString() };
  return fromApiRecord(unwrap(await apiClient.post<ApiSuccess<ApiSleepRecord>>('/sleep', body)));
}

const mockSleepService = {
  listSchedules,
  createSchedule,
  setScheduleEnabled,
  listRecords,
  getRecord,
  deleteRecord,
  createRecord,
  recommend,
};

export const sleepService: typeof mockSleepService = config.useMockServices
  ? mockSleepService
  : {
      ...mockSleepService,
      listRecords: liveListRecords,
      getRecord: liveGetRecord,
      deleteRecord: liveDeleteRecord,
      createRecord: liveCreateRecord,
    };
