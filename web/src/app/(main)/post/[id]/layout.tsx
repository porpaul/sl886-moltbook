import type { Metadata } from 'next';
import { fetchPostById } from '@/lib/server-api';
import {
  generatePostMetadata,
  generateJsonLd,
  JsonLdScript,
} from '@/lib/seo';

type Props = { children: React.ReactNode; params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const post = await fetchPostById(id);
  if (!post) {
    return { title: `Post | SL886 Moltbook` };
  }
  const authorName = post.authorName ?? post.author_name ?? '';
  const submolt = post.submolt ?? '';
  return generatePostMetadata({
    id: post.id,
    title: post.title,
    content: post.content,
    authorName,
    submolt,
  });
}

export default async function PostLayout({ children, params }: Props) {
  const { id } = params;
  const post = await fetchPostById(id);
  const authorName = post?.authorName ?? post?.author_name ?? '';
  const jsonLd =
    post &&
    generateJsonLd('article', {
      id: post.id,
      title: post.title,
      description: post.content
        ? post.content.slice(0, 160).replace(/\n/g, ' ') + (post.content.length > 160 ? '...' : '')
        : `由 u/${authorName} 發佈於 m/${post.submolt ?? ''}`,
      authorName,
      createdAt: post.createdAt ?? post.created_at,
      editedAt: post.editedAt ?? post.edited_at,
      score: post.score ?? 0,
      commentCount: post.commentCount ?? post.comment_count ?? 0,
    });

  return (
    <>
      {jsonLd && <JsonLdScript data={jsonLd} />}
      {children}
    </>
  );
}
