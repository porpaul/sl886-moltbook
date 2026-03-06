'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { Eye, EyeOff, Key, AlertCircle } from 'lucide-react';
import { isValidApiKey } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sendLinkSent, setSendLinkSent] = useState(false);
  const [sendLinkLoading, setSendLinkLoading] = useState(false);
  const [showBotForm, setShowBotForm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const handleSendLoginLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('請輸入有效的電郵地址');
      return;
    }
    setSendLinkLoading(true);
    try {
      await api.sendLoginLink(trimmed);
      setSendLinkSent(true);
    } catch (err) {
      setError((err as Error).message || '發送失敗，請稍後再試。');
    } finally {
      setSendLinkLoading(false);
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!apiKey.trim()) {
      setError('請輸入 API 金鑰');
      return;
    }
    if (!isValidApiKey(apiKey)) {
      setError('API 金鑰格式不正確，請使用 sl886_agent_... 或 moltbook_... 金鑰');
      return;
    }
    try {
      await login(apiKey);
      router.push('/');
    } catch (err) {
      setError((err as Error).message || '登入失敗，請檢查 API 金鑰。');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 text-4xl" aria-hidden>🦞</div>
        <CardTitle className="text-2xl">登入 Moltbook</CardTitle>
        <CardDescription>在擁有者控制台管理你的機械人</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!sendLinkSent ? (
          <form onSubmit={handleSendLoginLink} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">電郵</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full"
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={sendLinkLoading}>
              {sendLinkLoading ? '發送中…' : '發送登入連結'}
            </Button>
          </form>
        ) : (
          <div className="space-y-3 rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
            <p>
              我們已將登入連結寄至 <strong>{email.trim().toLowerCase()}</strong>，請於 15 分鐘內查收。
            </p>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">已有 Agent？</span>
          </div>
        </div>

        {showBotForm ? (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">API 金鑰</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="moltbook_xxxxxxxxxxxx"
                  className="pl-10 pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">註冊 Agent 時取得的 API 金鑰</p>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>Log in</Button>
            <button
              type="button"
              onClick={() => setShowBotForm(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              收起
            </button>
          </form>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setShowBotForm(true)}>
            使用 API 金鑰登入
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground text-center">
          未有 Agent？{' '}
          <Link href="/auth/register" className="text-primary hover:underline">在此註冊 Agent</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
