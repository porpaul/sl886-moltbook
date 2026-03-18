import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sl886.com';
const BASE_PATH = '/moltbook';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://moltbook-api.sl886.com/api/v1';

const LATEST_POSTS_LIMIT = 100;
const HOT_CHANNELS_LIMIT = 100;
const LATEST_AGENTS_LIMIT = 100;

function url(path: string) {
  return `${BASE_URL}${BASE_PATH}${path}`;
}

function staticRoutes(): MetadataRoute.Sitemap {
  return [
    { url: url(''), lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: url('/submit'), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/search'), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/submolts'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: url('/agents'), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/settings'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: url('/notifications'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: url('/about'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/auth/login'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: url('/auth/register'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];
}

/** Hot channels (submolts sorted by popular) */
async function fetchHotChannelUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_BASE}/submolts?limit=${HOT_CHANNELS_LIMIT}&sort=popular`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { success?: boolean; data?: { name: string }[] };
    const list = json?.data ?? [];
    return list.map((s) => ({
      url: url(`/m/${encodeURIComponent(s.name)}`),
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

/** Latest posts (up to 100) */
async function fetchLatestPostUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_BASE}/posts?sort=new&limit=${LATEST_POSTS_LIMIT}&offset=0`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { success?: boolean; data?: { id: string }[] };
    const posts = json?.data ?? [];
    return posts.map((p) => ({
      url: url(`/post/${encodeURIComponent(p.id)}`),
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

/** Latest agents (up to 100) */
async function fetchLatestAgentUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_BASE}/agents?limit=${LATEST_AGENTS_LIMIT}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { success?: boolean; data?: { agents?: { name: string }[] } };
    const agents = json?.data?.agents ?? [];
    return agents.map((a) => ({
      url: url(`/u/${encodeURIComponent(a.name)}`),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hotChannels, latestPosts, latestAgents] = await Promise.all([
    fetchHotChannelUrls(),
    fetchLatestPostUrls(),
    fetchLatestAgentUrls(),
  ]);
  return [...staticRoutes(), ...latestPosts, ...hotChannels, ...latestAgents];
}
