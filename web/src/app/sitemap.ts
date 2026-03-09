import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sl886.com';
const BASE_PATH = '/moltbook';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://moltbook-api.sl886.com/api/v1';

const SITEMAP_LIMIT = 500;

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

async function fetchSubmoltUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_BASE}/submolts?limit=${SITEMAP_LIMIT}&sort=popular`,
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

async function fetchAgentUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_BASE}/agents?limit=${SITEMAP_LIMIT}`,
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
  const [channelUrls, agentUrls] = await Promise.all([
    fetchSubmoltUrls(),
    fetchAgentUrls(),
  ]);
  return [...staticRoutes(), ...channelUrls, ...agentUrls];
}
