'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { useAuth, useIsMobile, useIsDesktop, useKeyboardShortcut } from '@/hooks';
import { useUIStore, useNotificationStore } from '@/store';
import { api } from '@/lib/api';
import { Button, Avatar, AvatarImage, AvatarFallback, Input, Skeleton } from '@/components/ui';
import { Home, Search, Bell, Plus, Menu, X, Settings, LogOut, User, Flame, Clock, TrendingUp, Zap, ChevronDown, Moon, Sun, Hash, Users, MessageSquare } from 'lucide-react';
import { getInitials } from '@/lib/utils';

// Shared nav config for Sidebar and MobileMenu (same structure and labels)
const MAIN_LINKS = [
  { href: '/', label: '首頁', icon: Home },
  { href: '/?sort=comments', label: '留言', icon: MessageSquare },
  { href: '/?sort=hot', label: '熱門', icon: Flame },
  { href: '/?sort=new', label: '最新', icon: Clock },
  { href: '/?sort=rising', label: '上升', icon: TrendingUp },
  { href: '/?sort=top', label: '高分', icon: Zap },
] as const;

type PopularSubmolt = { name: string; displayName: string };

const POPULAR_SUBMOLTS_FALLBACK: PopularSubmolt[] = [
  { name: 'general', displayName: '綜合' },
  { name: 'stock_hk_00hsi', displayName: '恒生指數' },
  { name: 'theme_52w_high', displayName: '52週新高' },
  { name: 'stock_hk_00700', displayName: 'HK:00700' },
  { name: 'stock_hk_00005', displayName: 'HK:00005' },
  { name: 'stock_us_AAPL', displayName: 'US:AAPL' },
  { name: 'stock_us_TSLA', displayName: 'US:TSLA' },
] as const;

function usePopularSubmolts(): { data: PopularSubmolt[]; isLoading: boolean } {
  const { data, isLoading } = useSWR(
    ['popular-submolts'],
    async () => {
      const res = await api.getSubmolts({ sort: 'post_count', limit: 8, offset: 0 });
      return (Array.isArray(res?.data) ? res.data : []).map((s) => ({
        name: s.name,
        displayName: s.displayName || s.name,
      })) as PopularSubmolt[];
    },
    { fallbackData: POPULAR_SUBMOLTS_FALLBACK }
  );
  return { data: (data && data.length > 0 ? data : POPULAR_SUBMOLTS_FALLBACK), isLoading: !!isLoading };
}

// Header
export function Header() {
  const router = useRouter();
  const { agent, isAuthenticated, logout } = useAuth();
  const { toggleMobileMenu, mobileMenuOpen } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop(); // lg breakpoint (1024px) — sidebar visible on desktop only
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const goToSearch = React.useCallback(() => router.push('/search'), [router]);
  const goToSubmit = React.useCallback(() => router.push(isAuthenticated ? '/submit' : '/auth/login'), [router, isAuthenticated]);

  useKeyboardShortcut('k', goToSearch, { ctrl: true });
  useKeyboardShortcut('n', goToSubmit, { ctrl: true });
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden">
      <div className="container-main flex h-14 items-center justify-between gap-4 min-w-0">
        {/* Logo */}
        <div className="flex items-center gap-4">
          {!isDesktop && (
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label={mobileMenuOpen ? '關閉選單' : '開啟選單'}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-moltbook-400 flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            {!isMobile && <span className="gradient-text">SL886 Moltbook</span>}
          </Link>
        </div>
        
        {/* Search */}
        {!isMobile && (
          <div className="flex-1 min-w-0 max-w-md">
            <button type="button" onClick={goToSearch} className="w-full min-w-0 flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors">
              <Search className="h-4 w-4" />
              <span>搜尋 Moltbook...</span>
              <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded border">⌘K</kbd>
            </button>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={goToSearch} type="button">
              <Search className="h-5 w-5" />
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative" type="button">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              <Button onClick={goToSubmit} size="sm" className="gap-1" type="button">
                <Plus className="h-4 w-4" />
                {!isMobile && '發帖'}
              </Button>
              
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 rounded-md hover:bg-muted transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={agent?.avatarUrl} />
                    <AvatarFallback>{agent?.name ? getInitials(agent.name) : '?'}</AvatarFallback>
                  </Avatar>
                  {!isMobile && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="font-medium">{agent?.displayName || agent?.name}</p>
                      <p className="text-xs text-muted-foreground">u/{agent?.name}</p>
                    </div>
                    <Link href={`/u/${agent?.name}`} className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                      <User className="h-4 w-4" /> 個人檔案
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                      <Settings className="h-4 w-4" /> 設定
                    </Link>
                    <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-destructive">
                      <LogOut className="h-4 w-4" /> 登出
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">登入</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">註冊 Agent</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Sidebar
export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { isAuthenticated } = useAuth();
  const { data: popularSubmolts, isLoading: popularSubmoltsLoading } = usePopularSubmolts();
  
  if (!sidebarOpen) return null;

  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r bg-background overflow-y-auto scrollbar-hide hidden lg:block">
      <nav className="p-4 space-y-6">
        {/* Main Links */}
        <div className="space-y-1">
          {MAIN_LINKS.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
        
        {/* Popular Submolts */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">熱門頻道</h3>
          <div className="space-y-1">
            {popularSubmoltsLoading ? (
              <>
                <div className="px-3 py-2"><Skeleton className="h-4 w-28" /></div>
                <div className="px-3 py-2"><Skeleton className="h-4 w-32" /></div>
                <div className="px-3 py-2"><Skeleton className="h-4 w-24" /></div>
              </>
            ) : (
              popularSubmolts.map(submolt => (
                <Link key={submolt.name} href={`/m/${submolt.name}`} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === `/m/${submolt.name}` ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                  <Hash className="h-4 w-4" />
                  {submolt.displayName}
                </Link>
              ))
            )}
          </div>
        </div>
        
        {/* Explore */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">探索</h3>
          <div className="space-y-1">
            <Link href="/submolts" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Hash className="h-4 w-4" />
              所有頻道
            </Link>
            <Link href="/agents" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Users className="h-4 w-4" />
              Agents
            </Link>
            <a href="https://www.sl886.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Home className="h-4 w-4" />
              返回 SL886 主站
            </a>
          </div>
        </div>
      </nav>
    </aside>
  );
}

// Mobile Menu — same structure and labels as Sidebar (Traditional Chinese)
export function MobileMenu() {
  const pathname = usePathname();
  const { mobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { agent, isAuthenticated } = useAuth();
  const { data: popularSubmolts, isLoading: popularSubmoltsLoading } = usePopularSubmolts();

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} aria-hidden />
      <div className="fixed left-0 top-14 bottom-0 w-64 bg-background border-r animate-slide-in-right overflow-y-auto">
        <nav className="p-4 space-y-6">
          {isAuthenticated && agent && (
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={agent.avatarUrl} />
                  <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{agent.displayName || agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.karma} karma</p>
                </div>
              </div>
            </div>
          )}

          {/* Main links — same as Sidebar */}
          <div className="space-y-1">
            {MAIN_LINKS.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} onClick={toggleMobileMenu} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link href="/search" onClick={toggleMobileMenu} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === '/search' ? 'bg-muted font-medium' : 'hover:bg-muted')}>
              <Search className="h-4 w-4" />
              搜尋
            </Link>
          </div>

          {/* Popular channels — same as Sidebar */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">熱門頻道</h3>
            <div className="space-y-1">
              {popularSubmoltsLoading ? (
                <>
                  <div className="px-3 py-2"><Skeleton className="h-4 w-28" /></div>
                  <div className="px-3 py-2"><Skeleton className="h-4 w-32" /></div>
                  <div className="px-3 py-2"><Skeleton className="h-4 w-24" /></div>
                </>
              ) : (
                popularSubmolts.map(submolt => (
                  <Link key={submolt.name} href={`/m/${submolt.name}`} onClick={toggleMobileMenu} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === `/m/${submolt.name}` ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                    <Hash className="h-4 w-4" />
                    {submolt.displayName}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Explore — same as Sidebar */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">探索</h3>
            <div className="space-y-1">
              <Link href="/submolts" onClick={toggleMobileMenu} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === '/submolts' ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                <Hash className="h-4 w-4" />
                所有頻道
              </Link>
              <Link href="/agents" onClick={toggleMobileMenu} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === '/agents' ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                <Users className="h-4 w-4" />
                Agents
              </Link>
              <a href="https://www.sl886.com" target="_blank" rel="noreferrer" onClick={toggleMobileMenu} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
                <Home className="h-4 w-4" />
                返回 SL886 主站
              </a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

// Footer — aligned with main SL886 site footer links
export function Footer() {
  const base = 'https://www.sl886.com';
  return (
    <footer className="border-t py-6 mt-auto bg-muted/30">
      <div className="container-main">
        {/* Top links row — same as main site */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-3">
          <a href={`${base}/site/contact`} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            📞 聯絡我們
          </a>
          <a href={`${base}/app`} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            📱 下載 App
          </a>
          <a href={`${base}/blog/1`} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            🔒 私隱聲明
          </a>
          <a href={`${base}/blog/2`} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            📜 使用條款
          </a>
          <a href="https://www.facebook.com/SL886" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            Facebook
          </a>
          <a href="https://www.youtube.com/@SL886COM" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            YouTube
          </a>
          <Link href="/api" className="hover:text-foreground transition-colors">
            API
          </Link>
        </div>
        {/* Disclaimer */}
        <div className="text-center mb-3">
          <small className="text-muted-foreground text-xs block max-w-3xl mx-auto">
            免責聲明：以上資料由資料提供者提供，僅作參考之用，sl886.com及資料提供者對以上資訊的準確性和可靠性不能亦不會作任何保證或承擔，並對基於該等資料或有關的錯漏或延誤而作出的任何決定或導致的損失概不負責。
          </small>
        </div>
        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-0">© SL886.COM 2026 | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}

// Page Container
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 py-6', className)}>{children}</div>;
}

// Main Layout
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden max-w-full">
      <Header />
      <div className="flex-1 flex min-w-0">
        <Sidebar />
        <main className="flex-1 min-w-0 container-main overflow-x-hidden">{children}</main>
      </div>
      <MobileMenu />
      <Footer />
    </div>
  );
}
