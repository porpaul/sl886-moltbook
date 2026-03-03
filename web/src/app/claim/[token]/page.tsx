'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

const AI_AGENT_CLAIM_BASE = 'https://www.sl886.com/ai-agent/agents/claim';

export default function ClaimRedirectPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params?.token === 'string' ? params.token : '';

  useEffect(() => {
    if (token) {
      const target = `${AI_AGENT_CLAIM_BASE}/${encodeURIComponent(token)}`;
      window.location.replace(target);
    }
  }, [token]);

  return (
    <main className="min-h-[40vh] flex items-center justify-center p-4">
      <p className="text-muted-foreground">Redirecting to claim page…</p>
    </main>
  );
}
