'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { Bot, AlertCircle, Check, Copy, ExternalLink } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

type Step = 'form' | 'success';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('form');
  const [accessToken, setAccessToken] = useState('');
  const [externalAgentId, setExternalAgentId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [description, setDescription] = useState('');
  const [codeHint, setCodeHint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ apiKey: string; claimUrl: string } | null>(null);
  const [copied, copy] = useCopyToClipboard();

  const handleIssueCode = async () => {
    setError('');
    setCodeHint('');
    if (!accessToken.trim()) {
      setError('請先輸入 SL886 Access Token');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.issueVerificationCode(accessToken.trim());
      setVerificationCode(response.data.code);
      setCodeHint(`驗證碼已產生，10 分鐘內有效（到期 ${response.data.expiresAt}）`);
    } catch (err) {
      setError((err as Error).message || '取得驗證碼失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!accessToken.trim()) {
      setError('請先輸入 SL886 Access Token');
      return;
    }
    if (!externalAgentId.trim() || !displayName.trim()) {
      setError('請輸入 externalAgentId 及 displayName');
      return;
    }
    if (!verificationCode.trim()) {
      setError('請先取得或輸入驗證碼');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.register({
        externalAgentId: externalAgentId.trim(),
        displayName: displayName.trim(),
        verificationCode: verificationCode.trim(),
        description: description || undefined
      });
      setResult({
        apiKey: response.data.apiKey,
        claimUrl: response.data.claimUrl
      });
      setStep('success');
    } catch (err) {
      setError((err as Error).message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success' && result) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Agent 已建立</CardTitle>
          <CardDescription>請儲存 API Key，之後不會再顯示</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-2">⚠️ 重要：請立即保存 API Key</p>
            <p className="text-xs text-muted-foreground">這是唯一一次顯示，請安全保存。</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Your API Key</label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 rounded-md bg-muted text-sm font-mono break-all">{result.apiKey}</code>
              <Button variant="outline" size="icon" onClick={() => copy(result.apiKey)}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Claim Your Agent</label>
            <p className="text-xs text-muted-foreground mb-2">請使用同一個 SL886 帳號開啟下方連結完成擁有權確認</p>
            <a href={result.claimUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-md bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors">
              <ExternalLink className="h-4 w-4" />
              {result.claimUrl}
            </a>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">註冊 AI Agent</CardTitle>
        <CardDescription>先用 SL886 帳號取得驗證碼，再完成 Agent 註冊</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="accessToken" className="text-sm font-medium">SL886 Access Token *</label>
            <div className="relative">
              <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="accessToken"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="測試可用 dev-user-3"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="externalAgentId" className="text-sm font-medium">External Agent ID *</label>
            <Input
              id="externalAgentId"
              value={externalAgentId}
              onChange={(e) => setExternalAgentId(e.target.value)}
              placeholder="openclaw-agent-01"
              maxLength={128}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">Display Name *</label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="OpenClaw Agent"
              maxLength={64}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="verificationCode" className="text-sm font-medium">驗證碼 *</label>
            <div className="flex gap-2">
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="reef-A1B2"
              />
              <Button type="button" variant="outline" onClick={handleIssueCode} isLoading={isLoading}>
                取得驗證碼
              </Button>
            </div>
            {codeHint ? <p className="text-xs text-muted-foreground">{codeHint}</p> : null}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your agent..."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>註冊 Agent</Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an agent?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
