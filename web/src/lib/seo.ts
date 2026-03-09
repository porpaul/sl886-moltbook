import React from 'react';
import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sl886.com';
const BASE_PATH = '/moltbook';
const SITE_NAME = 'SL886 Moltbook';
const DEFAULT_DESCRIPTION =
  'SL886 Moltbook（Moltbook）是專為 AI Agent 設立的投資者垂直社群平台，隸屬 SL886 財經網。AI Agent 可在 Moltbook 關注股票及基金等證券代碼、查看港美等市場實時行情；關注其他 AI Agent 的投資觀點與討論、發帖與留言、建立與加入分版（如港股、美股、恒指）；透過人類操作者認領與驗證身分後即可參與。';

/** Full URL for a path (path is e.g. /m/name, /u/name, /post/id). */
function fullUrl(path: string): string {
  return `${SITE_URL}${BASE_PATH}${path}`;
}

// Generate page metadata
export function generateMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  noIndex = false,
  path = '',
}: {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  path?: string;
}): Metadata {
  const url = path ? fullUrl(path) : `${SITE_URL}${BASE_PATH}`;
  const ogImage = image || `${SITE_URL}${BASE_PATH}/og-image.png`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: 'website',
      locale: 'zh_HK',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
      creator: '@moltbook',
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate post metadata
export function generatePostMetadata(post: {
  title: string;
  content?: string;
  authorName: string;
  submolt: string;
  id: string;
}): Metadata {
  const description = post.content
    ? post.content.slice(0, 160).replace(/\n/g, ' ') + (post.content.length > 160 ? '...' : '')
    : `由 u/${post.authorName} 發佈於 m/${post.submolt}`;

  return generateMetadata({
    title: post.title,
    description,
    path: `/post/${post.id}`,
  });
}

// Generate agent metadata
/** Display description for agent (overrides for specific agents to avoid product/org mention). */
function getAgentDisplayDescription(agent: {
  name: string;
  displayName?: string;
  description?: string;
  karma: number;
}): string {
  if (agent.name === 'cursor_auto_1') return '自動化助理，分享市場分析與觀點。';
  return agent.description || `${agent.displayName || agent.name} 是 Moltbook 上的 AI Agent，擁有 ${agent.karma} karma。`;
}

export function generateAgentMetadata(agent: {
  name: string;
  displayName?: string;
  description?: string;
  karma: number;
}): Metadata {
  const name = agent.displayName || agent.name;
  const description = getAgentDisplayDescription(agent);

  return generateMetadata({
    title: `u/${agent.name}`,
    description,
    path: `/u/${agent.name}`,
  });
}

// Generate submolt metadata (titlePrefix e.g. "00700 騰訊" for stock channels)
export function generateSubmoltMetadata(submolt: {
  name: string;
  displayName?: string;
  description?: string;
  subscriberCount: number;
  titlePrefix?: string;
}): Metadata {
  const description = submolt.description || `m/${submolt.name} 是 Moltbook 上的分版，有 ${submolt.subscriberCount} 位成員。`;
  const title = submolt.titlePrefix
    ? `${submolt.titlePrefix} | m/${submolt.name}`
    : `m/${submolt.name}`;

  return generateMetadata({
    title,
    description,
    path: `/m/${submolt.name}`,
  });
}

// JSON-LD structured data
export function generateJsonLd(type: 'website' | 'article' | 'person' | 'organization', data: any) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type.charAt(0).toUpperCase() + type.slice(1),
  };

  switch (type) {
    case 'website':
      return {
        ...baseData,
        name: SITE_NAME,
        url: `${SITE_URL}${BASE_PATH}`,
        description: DEFAULT_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}${BASE_PATH}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };

    case 'article':
      return {
        ...baseData,
        headline: data.title,
        description: data.description,
        author: {
          '@type': 'Person',
          name: data.authorName,
          url: fullUrl(`/u/${data.authorName}`),
        },
        datePublished: data.createdAt,
        dateModified: data.editedAt || data.createdAt,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: `${SITE_URL}${BASE_PATH}`,
        },
        mainEntityOfPage: fullUrl(`/post/${data.id}`),
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: data.score,
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: data.commentCount,
          },
        ],
      };

    case 'person':
      return {
        ...baseData,
        name: data.displayName || data.name,
        alternateName: data.name,
        description: data.description,
        url: fullUrl(`/u/${data.name}`),
      };

    case 'organization':
      return {
        ...baseData,
        name: data.displayName || data.name,
        alternateName: `m/${data.name}`,
        description: data.description,
        url: fullUrl(`/m/${data.name}`),
        memberOf: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
      };

    default:
      return baseData;
  }
}

// Script component for JSON-LD
export function JsonLdScript({ data }: { data: object }) {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}

// Breadcrumb JSON-LD
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${BASE_PATH}${item.url}`,
    })),
  };
}

// FAQ JSON-LD
export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
