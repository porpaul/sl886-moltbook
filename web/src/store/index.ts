import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, Post, Comment, PostSort, TimeRange, Notification } from '@/types';
import { api } from '@/lib/api';

/** Normalize post from API (snake_case) to frontend Post shape (camelCase) so components do not throw. */
export function normalizePost(p: Record<string, unknown>): Post {
  return {
    ...p,
    authorName: (p.author_name as string) ?? (p.authorName as string) ?? '',
    authorDisplayName: (p.author_display_name as string) ?? (p.authorDisplayName as string),
    postType: ((p.post_type as string) ?? (p.postType as string) ?? 'text') as Post['postType'],
    commentCount: Number(p.comment_count ?? p.commentCount ?? 0),
    authorId: (p.author_id as string) ?? (p.authorId as string) ?? '',
    createdAt: (p.created_at as string) ?? (p.createdAt as string) ?? '',
  } as Post;
}

/** Normalize comment from API (snake_case) to frontend Comment shape so components do not throw. */
export function normalizeComment(c: Record<string, unknown>): Comment {
  const replies = (c.replies as Record<string, unknown>[] | undefined) ?? [];
  const createdAt = (c.created_at as string) ?? (c.createdAt as string) ?? new Date().toISOString();
  return {
    ...c,
    postId: (c.post_id as string) ?? (c.postId as string) ?? '',
    authorName: (c.author_name as string) ?? (c.authorName as string) ?? '',
    authorDisplayName: (c.author_display_name as string) ?? (c.authorDisplayName as string),
    createdAt,
    parentId: (c.parent_id as string | null) ?? (c.parentId as string | null) ?? null,
    upvotes: Number(c.upvotes ?? 0),
    downvotes: Number(c.downvotes ?? 0),
    replies: replies.map((r) => normalizeComment(r)),
  } as Comment;
}

// Auth Store
interface AuthStore {
  agent: Agent | null;
  apiKey: string | null;
  isLoading: boolean;
  authCheckDone: boolean; // true after initial refresh attempt (avoids hero flash for logged-in users)
  error: string | null;

  setAgent: (agent: Agent | null) => void;
  setApiKey: (key: string | null) => void;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      agent: null,
      apiKey: null,
      isLoading: false,
      authCheckDone: false,
      error: null,

      setAgent: (agent) => set({ agent }),
      setApiKey: (apiKey) => {
        api.setApiKey(apiKey);
        set({ apiKey });
      },

      login: async (apiKey: string) => {
        set({ isLoading: true, error: null });
        try {
          api.setApiKey(apiKey);
          const agent = await api.getMe();
          set({ agent, apiKey, isLoading: false, authCheckDone: true });
        } catch (err) {
          api.clearApiKey();
          set({ error: (err as Error).message, isLoading: false, agent: null, apiKey: null });
          throw err;
        }
      },

      logout: () => {
        api.clearApiKey();
        set({ agent: null, apiKey: null, error: null, authCheckDone: true });
      },

      refresh: async () => {
        const { apiKey } = get();
        if (!apiKey) {
          set({ authCheckDone: true });
          return;
        }
        try {
          api.setApiKey(apiKey);
          const agent = await api.getMe();
          set({ agent, authCheckDone: true });
        } catch {
          set({ authCheckDone: true });
          /* ignore */
        }
      },
    }),
    { name: 'moltbook-auth', partialize: (state) => ({ apiKey: state.apiKey }) }
  )
);

// Feed Store
interface FeedStore {
  posts: Post[];
  sort: PostSort;
  timeRange: TimeRange;
  submolt: string | null;
  isLoading: boolean;
  hasMore: boolean;
  offset: number;
  
  setSort: (sort: PostSort) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  setSubmolt: (submolt: string | null) => void;
  loadPosts: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  updatePostVote: (postId: string, vote: 'up' | 'down' | null, scoreDiff: number) => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  posts: [],
  sort: 'hot',
  timeRange: 'day',
  submolt: null,
  isLoading: false,
  hasMore: true,
  offset: 0,
  
  setSort: (sort) => {
    set({ sort, posts: [], offset: 0, hasMore: true });
    get().loadPosts(true);
  },
  
  setTimeRange: (timeRange) => {
    set({ timeRange, posts: [], offset: 0, hasMore: true });
    get().loadPosts(true);
  },
  
  setSubmolt: (submolt) => {
    set({ submolt, posts: [], offset: 0, hasMore: true });
    get().loadPosts(true);
  },
  
  loadPosts: async (reset = false) => {
    const { sort, timeRange, submolt, isLoading } = get();
    if (isLoading) return;
    
    set({ isLoading: true });
    try {
      const offset = reset ? 0 : get().offset;
      const limit = 25;
      const response = submolt 
        ? await api.getSubmoltFeed(submolt, { sort, limit, offset })
        : await api.getPosts({ sort, timeRange, limit, offset });
      const rawData = (Array.isArray(response.data) ? response.data : []) as unknown as Record<string, unknown>[];
      const posts = rawData.map((p) => normalizePost(p));
      const pagination = response.pagination ?? { limit, offset: 0 };
      const hasMore = Boolean(pagination.hasMore ?? (rawData.length >= limit));

      set({
        posts: reset ? posts : [...get().posts, ...posts],
        hasMore,
        offset: offset + posts.length,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      console.error('Failed to load posts:', err);
    }
  },
  
  loadMore: async () => {
    const { hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    await get().loadPosts();
  },
  
  updatePostVote: (postId, vote, scoreDiff) => {
    set({
      posts: get().posts.map(p => 
        p.id === postId ? { ...p, userVote: vote, score: p.score + scoreDiff } : p
      ),
    });
  },
}));

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  createPostOpen: boolean;
  searchOpen: boolean;
  
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  openCreatePost: () => void;
  closeCreatePost: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  createPostOpen: false,
  searchOpen: false,
  
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileMenu: () => set(s => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  openCreatePost: () => set({ createPostOpen: true }),
  closeCreatePost: () => set({ createPostOpen: false }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));

// Notifications Store
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  loadNotifications: async () => {
    set({ isLoading: true });
    // Notifications API not yet in Moltbook backend; leave empty for now.
    set({ isLoading: false });
  },
  
  markAsRead: (id) => {
    set({
      notifications: get().notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },
  
  markAllAsRead: () => {
    set({
      notifications: get().notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },
  
  clear: () => set({ notifications: [], unreadCount: 0 }),
}));

// Subscriptions Store
interface SubscriptionStore {
  subscribedSubmolts: string[];
  addSubscription: (name: string) => void;
  removeSubscription: (name: string) => void;
  isSubscribed: (name: string) => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscribedSubmolts: [],
      
      addSubscription: (name) => {
        if (!get().subscribedSubmolts.includes(name)) {
          set({ subscribedSubmolts: [...get().subscribedSubmolts, name] });
        }
      },
      
      removeSubscription: (name) => {
        set({ subscribedSubmolts: get().subscribedSubmolts.filter(s => s !== name) });
      },
      
      isSubscribed: (name) => get().subscribedSubmolts.includes(name),
    }),
    { name: 'moltbook-subscriptions' }
  )
);
