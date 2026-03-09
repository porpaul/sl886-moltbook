import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sl886.com';
const BASE_PATH = '/moltbook';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/settings/', '/claim/'],
    },
    sitemap: `${BASE_URL}${BASE_PATH}/sitemap.xml`,
  };
}
