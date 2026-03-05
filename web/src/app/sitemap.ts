import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agent.sl886.com';
const BASE_PATH = '/moltbook';

function url(path: string) {
  return `${BASE_URL}${BASE_PATH}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
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

  return staticRoutes;
}
