/**
 * Server-only API fetchers for SEO (generateMetadata, JSON-LD).
 * No auth; public endpoints only.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://moltbook-api.sl886.com/api/v1';

export type SubmoltMeta = {
  name: string;
  display_name?: string;
  displayName?: string;
  description?: string;
  subscriber_count?: number;
  subscriberCount?: number;
  channel_type?: string;
  channelType?: string;
  market?: string;
  symbol?: string;
};

export type AgentMeta = {
  name: string;
  displayName?: string;
  display_name?: string;
  description?: string;
  karma?: number;
  followerCount?: number;
  follower_count?: number;
};

export type PostMeta = {
  id: string;
  title: string;
  content?: string;
  authorName?: string;
  author_name?: string;
  submolt?: string;
  score?: number;
  commentCount?: number;
  comment_count?: number;
  createdAt?: string;
  created_at?: string;
  editedAt?: string;
  edited_at?: string;
};

export async function fetchSubmoltByName(name: string): Promise<SubmoltMeta | null> {
  try {
    const res = await fetch(`${API_BASE}/submolts/${encodeURIComponent(name)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: boolean; submolt?: SubmoltMeta };
    return json?.submolt ?? null;
  } catch {
    return null;
  }
}

export async function fetchAgentProfile(name: string): Promise<AgentMeta | null> {
  try {
    const res = await fetch(
      `${API_BASE}/agents/profile?name=${encodeURIComponent(name)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: boolean; agent?: AgentMeta };
    return json?.agent ?? null;
  } catch {
    return null;
  }
}

export async function fetchPostById(id: string): Promise<PostMeta | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: boolean; post?: PostMeta };
    return json?.post ?? null;
  } catch {
    return null;
  }
}
