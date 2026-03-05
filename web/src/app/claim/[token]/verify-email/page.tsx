'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { PageContainer } from '@/components/layout';

const MOLTBOOK_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moltbook-api.sl886.com/api/v1';

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = typeof params?.token === 'string' ? decodeURIComponent(params.token) : '';
  const t = searchParams.get('t');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!t || !token) {
      setStatus('error');
      setErrorMessage('缺少驗證連結。');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${MOLTBOOK_API_URL}/agents/claim/${encodeURIComponent(token)}/verify-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ t }),
          }
        );
        const json = (await res.json()) as {
          success?: boolean;
          data?: { email?: string };
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setStatus('error');
          setErrorMessage(json.error || '驗證失敗。');
          return;
        }
        const email = json.data?.email;
        const query = new URLSearchParams({ step: 'success' });
        if (email) query.set('email', email);
        router.replace(`/claim/${encodeURIComponent(token)}?${query.toString()}`);
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t, token, router]);

  if (status === 'error') {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto py-12">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mt-0 mb-2">驗證失敗</h2>
            <p className="text-destructive text-sm mb-4">{errorMessage}</p>
            <Link href={`/claim/${encodeURIComponent(token)}`}>
              <Button variant="outline">返回認領頁面</Button>
            </Link>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-md mx-auto py-12">
        <Card className="p-6">
          <p className="text-muted-foreground">正在驗證你的電郵…</p>
        </Card>
      </div>
    </PageContainer>
  );
}
