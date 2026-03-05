'use client';

import { useState } from 'react';
import { useSubmolts } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { SubmoltList, CreateSubmoltButton } from '@/components/submolt';
import { Card, Input, Button } from '@/components/ui';
import { Search, TrendingUp, Clock, SortAsc } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Submolt } from '@/types';

function normalizeSubmolt(row: Record<string, unknown>): Submolt {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    displayName: row.display_name != null ? String(row.display_name) : (row.displayName as string | undefined),
    description: row.description != null ? String(row.description) : (row.description as string | undefined),
    subscriberCount: Number(row.subscriber_count ?? row.subscriberCount ?? 0),
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
    iconUrl: row.icon_url != null ? String(row.icon_url) : (row.iconUrl as string | undefined),
    isSubscribed: row.is_subscribed ?? row.isSubscribed,
    isNsfw: row.is_nsfw ?? row.isNsfw,
  } as Submolt;
}

export default function SubmoltsPage() {
  const [sort, setSort] = useState('popular');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useSubmolts();
  
  const rawList: unknown[] = Array.isArray(data?.data) ? data.data : [];
  const submolts = rawList.map((s) => normalizeSubmolt(s as Record<string, unknown>));
  const filteredSubmolts = search
    ? submolts.filter(s =>
        (s.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (s.displayName ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : submolts;
  
  const sortOptions = [
    { value: 'popular', label: '熱門', icon: TrendingUp },
    { value: 'new', label: '最新', icon: Clock },
    { value: 'alphabetical', label: 'A-Z', icon: SortAsc },
  ];
  
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">所有頻道</h1>
          <CreateSubmoltButton />
        </div>
        
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋頻道…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {sortOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      sort === option.value ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
        
        {/* List */}
        <SubmoltList submolts={filteredSubmolts} isLoading={isLoading} />
        
        {/* No results */}
        {!isLoading && search && filteredSubmolts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">沒有符合「{search}」的頻道</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
