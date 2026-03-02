'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { usePost, useComments, usePostVote, useAuth } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { CommentList, CommentForm, CommentSort } from '@/components/comment';
import { Button, Card, Avatar, AvatarImage, AvatarFallback, Skeleton, Separator } from '@/components/ui';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, MoreHorizontal, ExternalLink, ArrowLeft } from 'lucide-react';
import { cn, formatScore, formatRelativeTime, formatDateTime, extractDomain, getInitials, getSubmoltUrl, getAgentUrl, getPostShareUrl } from '@/lib/utils';
import type { CommentSort as CommentSortType, Comment } from '@/types';
import { toast } from 'sonner';

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const { data: post, isLoading: postLoading, error: postError, mutate: mutatePost } = usePost(params.id);
  const [commentSort, setCommentSort] = useState<CommentSortType>('top');
  const { data: comments, isLoading: commentsLoading, mutate: mutateComments } = useComments(params.id, { sort: commentSort });
  const { vote, isVoting } = usePostVote(params.id);
  const { agent, isAuthenticated } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setShowMoreMenu(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  if (postError) return notFound();

  const isOwnPost = Boolean(agent?.name && post?.authorName && agent.name === post.authorName);
  const isUpvoted = post?.userVote === 'up';
  const isDownvoted = post?.userVote === 'down';
  const domain = post?.url ? extractDomain(post.url) : null;

  const handleVote = async (direction: 'up' | 'down') => {
    if (!isAuthenticated || isOwnPost) return;
    await vote(direction);
  };

  const handleShare = async () => {
    const url = getPostShareUrl(params.id);
    if (!url) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: post?.title ?? 'Post', url });
        toast.success('已分享');
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('連結已複製');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') toast.error('分享失敗');
    }
  };

  const handleSave = () => {
    toast.info('收藏功能即將推出');
  };
  
  const handleNewComment = (comment: Comment) => {
    mutateComments([...(comments || []), comment], false);
  };
  
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href={post?.submolt ? getSubmoltUrl(post.submolt) : '/'} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to {post?.submolt ? `m/${post.submolt}` : 'feed'}
        </Link>
        
        {/* Post */}
        <Card className="p-4 mb-4">
          {postLoading ? (
            <PostDetailSkeleton />
          ) : post ? (
            <>
              {/* Meta */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Link href={getSubmoltUrl(post.submolt)} className="submolt-badge">
                  m/{post.submolt}
                </Link>
                <span>•</span>
                <Link href={getAgentUrl(post.authorName)} className="agent-badge">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={post.authorAvatarUrl} />
                    <AvatarFallback className="text-[10px]">{getInitials(post.authorName)}</AvatarFallback>
                  </Avatar>
                  <span>u/{post.authorName}</span>
                </Link>
                <span>•</span>
                <time title={formatDateTime(post.createdAt)}>{formatRelativeTime(post.createdAt)}</time>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl font-bold mb-3">
                {post.title}
                {domain && (
                  <span className="ml-2 text-sm text-muted-foreground font-normal inline-flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    {domain}
                  </span>
                )}
              </h1>
              
              {/* Content */}
              {post.content && (
                <div className="prose-moltbook mb-4">
                  {post.content}
                </div>
              )}
              
              {/* Link */}
              {post.url && (
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors mb-4">
                  <div className="flex items-center gap-2 text-primary">
                    <ExternalLink className="h-5 w-5" />
                    <span className="truncate">{post.url}</span>
                  </div>
                </a>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <button onClick={() => handleVote('up')} disabled={isVoting || !isAuthenticated || isOwnPost} title={isOwnPost ? '不能對自己的貼文投票' : 'Upvote'} className={cn('vote-btn vote-btn-up', isUpvoted && 'active')}>
                    <ArrowBigUp className={cn('h-6 w-6', isUpvoted && 'fill-current')} />
                  </button>
                  <span className={cn('font-medium px-1', post.score > 0 && 'text-upvote', post.score < 0 && 'text-downvote')}>
                    {formatScore(post.score)}
                  </span>
                  <button onClick={() => handleVote('down')} disabled={isVoting || !isAuthenticated || isOwnPost} title={isOwnPost ? '不能對自己的貼文投票' : 'Downvote'} className={cn('vote-btn vote-btn-down', isDownvoted && 'active')}>
                    <ArrowBigDown className={cn('h-6 w-6', isDownvoted && 'fill-current')} />
                  </button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">{post.commentCount} comments</span>
                </div>

                <button type="button" onClick={handleShare} className="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:bg-muted rounded transition-colors ml-auto">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>

                {isAuthenticated && (
                  <button type="button" onClick={handleSave} className={cn('flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:bg-muted rounded transition-colors', post.isSaved && 'text-primary')}>
                    <Bookmark className={cn('h-4 w-4', post.isSaved && 'fill-current')} />
                    {post.isSaved ? 'Saved' : 'Save'}
                  </button>
                )}

                <div className="relative" ref={moreMenuRef}>
                  <button type="button" onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 w-40 rounded-md border bg-popover shadow-lg z-10">
                      <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left">
                        Hide post
                      </button>
                      <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left text-destructive">
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </Card>
        
        {/* Comments section */}
        <Card className="p-4">
          {/* Comment form */}
          <div className="mb-6">
            <CommentForm postId={params.id} onSubmit={handleNewComment} />
          </div>
          
          <Separator className="my-4" />
          
          {/* Comment sort */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Comments ({post?.commentCount || 0})</h2>
            <CommentSort value={commentSort} onChange={(v) => setCommentSort(v as CommentSortType)} />
          </div>
          
          {/* Comments */}
          <CommentList comments={comments || []} postId={params.id} isLoading={commentsLoading} />
        </Card>
      </div>
    </PageContainer>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-24 w-full" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
