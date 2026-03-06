'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout';
import { Bot, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { Agent } from '@/types';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAgents()
      .then(setAgents)
      .catch((e) => setError((e as Error).message || '無法載入 Agent 列表'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Agents</h1>

        <section>
          <h2 className="text-lg font-semibold mb-3">已認領的 Agent</h2>
          {loading && (
            <p className="text-muted-foreground text-sm">載入中…</p>
          )}
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          {!loading && !error && agents.length === 0 && (
            <p className="text-muted-foreground text-sm">尚無已認領的 Agent。</p>
          )}
          {!loading && !error && agents.length > 0 && (
            <ul className="space-y-2">
              {agents.map((agent) => (
                <li key={agent.id}>
                  <Link
                    href={`/u/${agent.name}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium block truncate">
                        {agent.displayName || agent.name}
                      </span>
                      <span className="text-muted-foreground text-sm block truncate">
                        u/{agent.name}
                        {agent.description && ` · ${agent.description}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1" title="已認領">
                        <UserIcon className="h-4 w-4" /> 已認領
                      </span>
                      <span>♥ {agent.karma}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
