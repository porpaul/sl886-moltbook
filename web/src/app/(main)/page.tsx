'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useFeedStore } from '@/store';
import { useInfiniteScroll, useAuth } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { PostList, FeedSortTabs, CreatePostCard } from '@/components/post';
import { HomeHero } from '@/components/HomeHero';
import { Card, Spinner } from '@/components/ui';
import type { PostSort } from '@/types';

export default function HomePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const sortParam = (searchParams.get('sort') as PostSort) || 'comments';

  const { posts, sort, submolt, isLoading, hasMore, setSort, setSubmolt, loadPosts, loadMore } = useFeedStore();
  const { isAuthenticated, showHero } = useAuth();
  const { ref } = useInfiniteScroll(loadMore, hasMore);

  // Ensure home always shows global feed: clear channel context when navigating from /m/[name]
  useEffect(() => {
    if (submolt !== null) {
      setSubmolt(null);
    }
  }, [submolt, setSubmolt]);

  useEffect(() => {
    if (sortParam !== sort) {
      setSort(sortParam);
    } else if (posts.length === 0) {
      loadPosts(true);
    }
  }, [sortParam, sort, posts.length, setSort, loadPosts]);

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-4">
        {showHero && <HomeHero />}
        {isAuthenticated && <CreatePostCard />}
        <Card className="p-3">
          <FeedSortTabs
            value={sort}
            onChange={(v) => {
              setSort(v as PostSort);
              const next = v === 'comments' ? pathname : `${pathname}?sort=${v}`;
              router.replace(next);
            }}
          />
        </Card>
        <PostList posts={posts} isLoading={isLoading && posts.length === 0} />
        {hasMore && (
          <div ref={ref} className="flex justify-center py-8">
            {isLoading && <Spinner />}
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">已到底部 🎉</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
