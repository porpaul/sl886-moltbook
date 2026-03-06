'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useSubmolt, useAuth, useInfiniteScroll } from '@/hooks';
import { useFeedStore, useSubscriptionStore } from '@/store';
import { PageContainer } from '@/components/layout';
import { PostList, FeedSortTabs, CreatePostCard } from '@/components/post';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Avatar, AvatarImage, AvatarFallback, Skeleton, Badge, Spinner } from '@/components/ui';
import { Users, Calendar, Settings, Plus } from 'lucide-react';
import { cn, formatDate, formatScore, getInitials } from '@/lib/utils';
import { api } from '@/lib/api';
import type { PostSort } from '@/types';

function parseStockSubmoltName(name: string): { market: string; symbol: string } | null {
  const m = String(name ?? '').trim().match(/^stock_(hk|us)_(.+)$/i);
  if (!m) return null;
  return { market: m[1].toUpperCase(), symbol: String(m[2] ?? '').trim().toUpperCase() };
}

function getStockPrettyName(market: string, symbol: string): string | null {
  if (market === 'HK' && symbol === '00HSI') return '恒指';
  return null;
}

export default function SubmoltPage() {
  const params = useParams<{ name: string }>();
  const searchParams = useSearchParams();
  const sortParam = (searchParams.get('sort') as PostSort) || 'hot';
  
  const { data: submolt, isLoading: submoltLoading, error } = useSubmolt(params.name);
  const { isAuthenticated } = useAuth();
  const { isSubscribed, addSubscription, removeSubscription } = useSubscriptionStore();
  const { posts, sort, isLoading, hasMore, setSort, setSubmolt, loadMore } = useFeedStore();
  const { ref } = useInfiniteScroll(loadMore, hasMore);
  
  const [subscribing, setSubscribing] = useState(false);
  const subscribed = submolt?.isSubscribed || isSubscribed(params.name);
  
  useEffect(() => {
    setSubmolt(params.name);
    if (sortParam !== sort) setSort(sortParam);
  }, [params.name, sortParam, sort, setSubmolt, setSort]);
  
  const handleSubscribe = async () => {
    if (!isAuthenticated || subscribing) return;
    setSubscribing(true);
    try {
      if (subscribed) {
        await api.unsubscribeSubmolt(params.name);
        removeSubscription(params.name);
      } else {
        await api.subscribeSubmolt(params.name);
        addSubscription(params.name);
      }
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setSubscribing(false);
    }
  };
  
  if (error || (!submoltLoading && !submolt)) return notFound();

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        {/* Banner */}
        {(() => {
          const parsed = submolt?.channelType === 'stock'
            ? { market: String(submolt.market ?? '').toUpperCase(), symbol: String(submolt.symbol ?? '').toUpperCase() }
            : parseStockSubmoltName(submolt?.name ?? params.name);

          const market = parsed?.market || null;
          const symbol = parsed?.symbol || null;
          const stockLabel = market && symbol ? `${market}:${symbol}` : null;
          const stockPretty = market && symbol ? getStockPrettyName(market, symbol) : null;

          const c1 = (submolt?.bannerColor && String(submolt.bannerColor).trim()) || 'hsl(var(--primary))';
          const c2 = (submolt?.themeColor && String(submolt.themeColor).trim()) || 'hsl(var(--primary))';
          const bannerUrl = submolt?.bannerUrl && String(submolt.bannerUrl).trim() ? String(submolt.bannerUrl).trim() : null;

          const backgroundImage = bannerUrl
            ? `linear-gradient(90deg, ${c1}, ${c2}), url("${bannerUrl}")`
            : `linear-gradient(90deg, ${c1}, ${c2})`;

          return (
            <div
              className="relative h-32 rounded-lg mb-4 overflow-hidden"
              style={{
                backgroundImage,
                backgroundSize: bannerUrl ? 'cover' : undefined,
                backgroundPosition: bannerUrl ? 'center' : undefined,
              }}
            >
              <div className="absolute inset-0 bg-background/10" />
              {stockLabel && (
                <div className="absolute left-4 bottom-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-sm font-medium">
                    <span>{stockLabel}</span>
                    {stockPretty && (
                      <span className="text-muted-foreground">· {stockPretty}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Submolt header */}
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-background -mt-12">
                    <AvatarImage src={submolt?.iconUrl} />
                    <AvatarFallback className="text-xl">{submolt?.name ? getInitials(submolt.name) : 'M'}</AvatarFallback>
                  </Avatar>
                  <div>
                    {submoltLoading ? (
                      <>
                        <Skeleton className="h-7 w-32 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold">{submolt?.displayName || submolt?.name}</h1>
                        <p className="text-muted-foreground">m/{submolt?.name}</p>
                      </>
                    )}
                  </div>
                </div>
                
                {isAuthenticated && (
                  <Button onClick={handleSubscribe} variant={subscribed ? 'secondary' : 'default'} disabled={subscribing}>
                    {subscribed ? 'Joined' : 'Join'}
                  </Button>
                )}
              </div>
              
              {submolt?.description && (
                <p className="mt-4 text-sm text-muted-foreground">{submolt.description}</p>
              )}
            </Card>
            
            {/* Create post */}
            {isAuthenticated && <CreatePostCard submolt={params.name} />}
            
            {/* Sort tabs */}
            <Card className="p-3">
              <FeedSortTabs value={sort} onChange={(v) => setSort(v as PostSort)} />
            </Card>
            
            {/* Posts */}
            <PostList posts={posts} isLoading={isLoading && posts.length === 0} showSubmolt={false} />
            
            {/* Load more */}
            {hasMore && (
              <div ref={ref} className="flex justify-center py-8">
                {isLoading && <Spinner />}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">關於此頻道</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submoltLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </>
                ) : (
                  <>
                    <p className="text-sm">{submolt?.description || '歡迎來到這個分版！'}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatScore(submolt?.subscriberCount || 0)}</span>
                        <span className="text-muted-foreground">位成員</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      建立於 {submolt?.createdAt ? formatDate(submolt.createdAt) : '最近'}
                    </div>
                    
                    {isAuthenticated && (
                      <Link href={`/submit?submolt=${encodeURIComponent(params.name)}`}>
                        <Button className="w-full gap-2">
                          <Plus className="h-4 w-4" />
                          發帖
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Rules */}
            {submolt?.rules && submolt.rules.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {submolt.rules.map((rule, i) => (
                      <li key={rule.id} className="text-sm">
                        <span className="font-medium">{i + 1}. {rule.title}</span>
                        {rule.description && (
                          <p className="text-muted-foreground text-xs mt-0.5">{rule.description}</p>
                        )}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
            
            {/* Moderators */}
            {submolt?.moderators && submolt.moderators.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Moderators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submolt.moderators.map(mod => (
                      <Link key={mod.id} href={`/u/${mod.name}`} className="flex items-center gap-2 text-sm hover:bg-muted p-1 rounded">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={mod.avatarUrl} />
                          <AvatarFallback className="text-[10px]">{getInitials(mod.name)}</AvatarFallback>
                        </Avatar>
                        <span>u/{mod.name}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
