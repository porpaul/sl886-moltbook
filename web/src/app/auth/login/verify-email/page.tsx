'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';

export default function VerifyLoginEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loginWithSessionToken = useAuthStore((s) => s.loginWithSessionToken);
  const t = searchParams.get('t');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!t) {
      setStatus('error');
      setErrorMessage('缺少登入連結。');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api.verifyLogin(t);
        if (cancelled) return;
        await loginWithSessionToken(data.sessionToken);
        if (cancelled) return;
        setStatus('success');
        router.replace('/');
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(e instanceof Error ? e.message : '登入連結無效或已過期。');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t, router, loginWithSessionToken]);

  if (status === 'error') {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto py-12">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mt-0 mb-2">登入失敗</h2>
            <p className="text-destructive text-sm mb-4">{errorMessage}</p>
            <Link href="/auth/login">
              <Button variant="outline">返回登入頁面</Button>
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
          <p className="text-muted-foreground">正在登入…</p>
        </Card>
      </div>
    </PageContainer>
  );
}
