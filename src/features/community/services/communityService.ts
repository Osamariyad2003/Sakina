import { storage, storageKeys } from '../../../core/storage/mmkv';
import { AppError } from '../../../core/errors';
import { config } from '../../../config';
import i18n from '../../../i18n';
import { containsRiskLanguage } from '../../ai-companion/models/riskDetection';
import {
  communityGroups,
  seedThreads,
  getGroup,
  emptyCommunityProfile,
  MAX_POST_LENGTH,
  MIN_POST_LENGTH,
  MAX_ALIAS_LENGTH,
  type CommunityGroup,
  type CommunityPost,
  type CommunityThread,
  type CommunityProfile,
} from '../models/communityContent';

/**
 * [ASSUMPTION] There is no community backend and no moderation queue — seed
 * threads are read-only illustrative content and everything the user writes
 * persists to MMKV on this device only. `report()` records locally so the
 * action isn't a lie about a queue that doesn't exist.
 *
 * The safety rule is enforced *here*, not in the screen: `createThread` and
 * `reply` refuse risk language outright and throw a `validation` error the
 * composer turns into a route to the Safety page. Putting it in the service
 * means no future caller can bypass it.
 */

function fakeDelay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Everything this device wrote: threads the user started, and replies. */
interface LocalCommunityData {
  threads: CommunityThread[];
  posts: CommunityPost[];
  /** Post ids the user has supported or reported — applies to seed posts too. */
  supportedPostIds: string[];
  reportedPostIds: string[];
}

const emptyLocal: LocalCommunityData = { threads: [], posts: [], supportedPostIds: [], reportedPostIds: [] };

function readLocal(): LocalCommunityData {
  const stored = storage.getJSON<Partial<LocalCommunityData>>(storageKeys.mockCommunityPosts);
  return {
    threads: stored?.threads ?? [],
    posts: stored?.posts ?? [],
    supportedPostIds: stored?.supportedPostIds ?? [],
    reportedPostIds: stored?.reportedPostIds ?? [],
  };
}

function writeLocal(data: LocalCommunityData) {
  storage.setJSON(storageKeys.mockCommunityPosts, data);
}

function getProfileSync(): CommunityProfile {
  return storage.getJSON<CommunityProfile>(storageKeys.communityProfile) ?? emptyCommunityProfile;
}

/** Seed posts + this device's posts, decorated with the user's own support/report state. */
function allPosts(local: LocalCommunityData): CommunityPost[] {
  const supported = new Set(local.supportedPostIds);
  const reported = new Set(local.reportedPostIds);
  const seeded: CommunityPost[] = seedThreads.flatMap((seed) =>
    seed.posts.map((post) => ({
      ...post,
      isMine: false,
      supportedByMe: supported.has(post.id),
      reportedByMe: reported.has(post.id),
      supportCount: post.supportCount + (supported.has(post.id) ? 1 : 0),
    })),
  );
  const mine = local.posts.map((post) => ({
    ...post,
    isMine: true,
    supportedByMe: supported.has(post.id),
    reportedByMe: reported.has(post.id),
  }));
  return [...seeded, ...mine];
}

function allThreads(local: LocalCommunityData): CommunityThread[] {
  const posts = allPosts(local);
  const seeded: CommunityThread[] = seedThreads.map((seed) => {
    const threadPosts = posts.filter((p) => p.threadId === seed.thread.id);
    return {
      ...seed.thread,
      isMine: false,
      // Replies exclude the opening post.
      replyCount: Math.max(0, threadPosts.length - 1),
      supportCount: threadPosts.reduce((sum, p) => sum + p.supportCount, 0),
    };
  });
  const mine = local.threads.map((thread) => {
    const threadPosts = posts.filter((p) => p.threadId === thread.id);
    return {
      ...thread,
      isMine: true,
      replyCount: Math.max(0, threadPosts.length - 1),
      supportCount: threadPosts.reduce((sum, p) => sum + p.supportCount, 0),
    };
  });
  return [...seeded, ...mine].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function listGroups(): Promise<(CommunityGroup & { threadCount: number })[]> {
  await fakeDelay(150);
  const threads = allThreads(readLocal());
  return communityGroups.map((group) => ({
    ...group,
    threadCount: threads.filter((t) => t.groupId === group.id).length,
  }));
}

async function listThreads(groupId: string): Promise<CommunityThread[]> {
  await fakeDelay();
  if (!getGroup(groupId)) throw new AppError(i18n.t('community.groupNotFound'), 'unknown', 404);
  return allThreads(readLocal()).filter((t) => t.groupId === groupId);
}

async function getThread(threadId: string): Promise<{ thread: CommunityThread; posts: CommunityPost[] }> {
  await fakeDelay(200);
  const local = readLocal();
  const thread = allThreads(local).find((t) => t.id === threadId);
  if (!thread) throw new AppError(i18n.t('community.threadNotFound'), 'unknown', 404);
  const posts = allPosts(local)
    .filter((p) => p.threadId === threadId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  return { thread, posts };
}

async function getProfile(): Promise<CommunityProfile> {
  return getProfileSync();
}

async function saveProfile(profile: CommunityProfile): Promise<CommunityProfile> {
  const alias = profile.alias.trim().slice(0, MAX_ALIAS_LENGTH);
  if (profile.hasAcceptedGuidelines && alias.length === 0) {
    throw new AppError(i18n.t('community.aliasRequired'), 'validation', 400);
  }
  const next: CommunityProfile = { ...profile, alias };
  storage.setJSON(storageKeys.communityProfile, next);
  return next;
}

/**
 * Shared gate for anything the user writes. Throws rather than returning a
 * flag so no caller can forget to check it.
 */
function assertPostable(body: string, profile: CommunityProfile) {
  if (!profile.hasAcceptedGuidelines || !profile.alias) {
    throw new AppError(i18n.t('community.guidelinesRequired'), 'validation', 403);
  }
  const trimmed = body.trim();
  if (trimmed.length < MIN_POST_LENGTH) {
    throw new AppError(i18n.t('community.postTooShort'), 'validation', 400);
  }
  if (trimmed.length > MAX_POST_LENGTH) {
    throw new AppError(i18n.t('community.postTooLong'), 'validation', 400);
  }
  // Peers are not a crisis service — this never becomes a post.
  if (containsRiskLanguage(trimmed)) {
    throw new AppError(i18n.t('community.riskBlocked'), 'validation', 422);
  }
}

async function createThread(groupId: string, title: string, body: string): Promise<CommunityThread> {
  await fakeDelay();
  if (!getGroup(groupId)) throw new AppError(i18n.t('community.groupNotFound'), 'unknown', 404);
  const profile = getProfileSync();
  assertPostable(body, profile);
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < MIN_POST_LENGTH) {
    throw new AppError(i18n.t('community.titleRequired'), 'validation', 400);
  }
  if (containsRiskLanguage(trimmedTitle)) {
    throw new AppError(i18n.t('community.riskBlocked'), 'validation', 422);
  }

  const local = readLocal();
  const now = new Date().toISOString();
  const id = `thread-local-${Date.now()}`;
  const thread: CommunityThread = {
    id,
    groupId,
    title: trimmedTitle,
    authorAlias: profile.alias,
    isMine: true,
    createdAt: now,
    excerpt: body.trim().slice(0, 140),
    replyCount: 0,
    supportCount: 0,
  };
  const openingPost: CommunityPost = {
    id: `post-local-${Date.now()}`,
    threadId: id,
    authorAlias: profile.alias,
    isMine: true,
    body: body.trim(),
    createdAt: now,
    supportCount: 0,
  };
  writeLocal({ ...local, threads: [thread, ...local.threads], posts: [...local.posts, openingPost] });
  return thread;
}

async function reply(threadId: string, body: string): Promise<CommunityPost> {
  await fakeDelay();
  const local = readLocal();
  if (!allThreads(local).some((t) => t.id === threadId)) {
    throw new AppError(i18n.t('community.threadNotFound'), 'unknown', 404);
  }
  const profile = getProfileSync();
  assertPostable(body, profile);

  const post: CommunityPost = {
    id: `post-local-${Date.now()}`,
    threadId,
    authorAlias: profile.alias,
    isMine: true,
    body: body.trim(),
    createdAt: new Date().toISOString(),
    supportCount: 0,
  };
  writeLocal({ ...local, posts: [...local.posts, post] });
  return post;
}

/** "This helped me too" — a one-way acknowledgement the user can also undo. */
async function toggleSupport(postId: string): Promise<void> {
  const local = readLocal();
  const supported = local.supportedPostIds.includes(postId)
    ? local.supportedPostIds.filter((id) => id !== postId)
    : [postId, ...local.supportedPostIds];
  writeLocal({ ...local, supportedPostIds: supported });
}

/**
 * Records a report locally and hides the post from this device. Without a
 * moderation backend that is the honest extent of it — the UI says so.
 */
async function report(postId: string): Promise<void> {
  await fakeDelay(200);
  const local = readLocal();
  if (local.reportedPostIds.includes(postId)) return;
  writeLocal({ ...local, reportedPostIds: [postId, ...local.reportedPostIds] });
}

async function deleteMyPost(postId: string): Promise<void> {
  await fakeDelay(200);
  const local = readLocal();
  const post = local.posts.find((p) => p.id === postId);
  if (!post) throw new AppError(i18n.t('community.postNotFound'), 'unknown', 404);
  writeLocal({ ...local, posts: local.posts.filter((p) => p.id !== postId) });
}

if (!config.useMockServices) {
  throw new AppError(
    'communityService: config.useMockServices=false but no real implementation is wired up yet.',
    'unknown',
  );
}

export const communityService = {
  listGroups,
  listThreads,
  getThread,
  getProfile,
  saveProfile,
  createThread,
  reply,
  toggleSupport,
  report,
  deleteMyPost,
};
