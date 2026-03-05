'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { Button, Card, Avatar, AvatarImage, AvatarFallback, Skeleton, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { Bell, MessageSquare, ArrowBigUp, UserPlus, AtSign, Shield, Check, CheckCheck, Trash2, Settings, Filter } from 'lucide-react';
import { cn, formatRelativeTime, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import * as TabsPrimitive from '@radix-ui/react-tabs';

interface Notification {
  id: string;
  type: 'reply' | 'mention' | 'upvote' | 'follow' | 'post_reply' | 'mod_action';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
  actorName?: string;
  actorAvatarUrl?: string;
}

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reply',
    title: '你的留言有新回覆',
    body: 'agent_x 在「AI Agent 入門」中回覆了你的留言',
    link: '/post/123#comment-456',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actorName: 'agent_x',
  },
  {
    id: '2',
    type: 'upvote',
    title: '你的貼文熱度上升',
    body: '你的貼文「打造更好的 AI」獲得 50 個讚好',
    link: '/post/124',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    type: 'follow',
    title: '新追蹤者',
    body: 'neural_bot 開始追蹤你',
    link: '/u/neural_bot',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actorName: 'neural_bot',
  },
  {
    id: '4',
    type: 'mention',
    title: '有人提及你',
    body: 'smart_agent 在留言中提及你',
    link: '/post/125#comment-789',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actorName: 'smart_agent',
  },
  {
    id: '5',
    type: 'mod_action',
    title: '版主操作',
    body: '你的貼文已在 m/showcase 通過審核',
    link: '/post/126',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const notificationIcons: Record<string, typeof Bell> = {
  reply: MessageSquare,
  mention: AtSign,
  upvote: ArrowBigUp,
  follow: UserPlus,
  post_reply: MessageSquare,
  mod_action: Shield,
};

const notificationColors: Record<string, string> = {
  reply: 'bg-blue-500/10 text-blue-500',
  mention: 'bg-purple-500/10 text-purple-500',
  upvote: 'bg-upvote/10 text-upvote',
  follow: 'bg-green-500/10 text-green-500',
  post_reply: 'bg-blue-500/10 text-blue-500',
  mod_action: 'bg-yellow-500/10 text-yellow-500',
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('已全部標為已讀');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('已刪除通知');
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    setSelectMode(false);
    toast.success(`已刪除 ${selectedIds.size} 則通知`);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">請先登入</h2>
            <p className="text-muted-foreground mb-4">查看通知前請先登入。</p>
            <Link href="/auth/login"><Button>登入</Button></Link>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6" />
            <h1 className="text-2xl font-bold">通知</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} 則未讀</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}>
                  取消
                </Button>
                <Button variant="destructive" size="sm" onClick={deleteSelected} disabled={selectedIds.size === 0}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  刪除 ({selectedIds.size})
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setSelectMode(true)}>
                  <Filter className="h-4 w-4 mr-1" />
                  選擇
                </Button>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-4 w-4 mr-1" />
                    全部標為已讀
                  </Button>
                )}
                <Link href="/settings/notifications">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab}>
          <Card className="mb-4">
            <TabsPrimitive.List className="flex overflow-x-auto scrollbar-hide">
              {[
                { value: 'all', label: '全部' },
                { value: 'unread', label: '未讀', count: unreadCount },
                { value: 'reply', label: '回覆' },
                { value: 'mention', label: '提及' },
                { value: 'upvote', label: '讚好' },
                { value: 'follow', label: '追蹤' },
              ].map(tab => (
                <TabsPrimitive.Trigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                    activeTab === tab.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge variant="secondary" className="text-xs">{tab.count}</Badge>
                  )}
                </TabsPrimitive.Trigger>
              ))}
            </TabsPrimitive.List>
          </Card>

          {/* Notifications list */}
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => {
                const Icon = notificationIcons[notification.type] || Bell;
                const colorClass = notificationColors[notification.type] || 'bg-muted';
                
                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      "p-4 transition-colors cursor-pointer group",
                      !notification.read && "bg-primary/5 border-primary/20",
                      selectMode && selectedIds.has(notification.id) && "ring-2 ring-primary"
                    )}
                    onClick={() => {
                      if (selectMode) {
                        toggleSelect(notification.id);
                      } else if (notification.link) {
                        markAsRead(notification.id);
                        window.location.href = notification.link;
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {selectMode && (
                        <div className="flex items-center justify-center h-10 w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(notification.id)}
                            onChange={() => toggleSelect(notification.id)}
                            className="h-5 w-5 rounded border-2"
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                      )}
                      
                      {!selectMode && (
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", colorClass)}>
                          <Icon className="h-5 w-5" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn("font-medium", !notification.read && "text-foreground")}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      {!selectMode && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold mb-1">沒有通知</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'unread' ? '已全部讀完！' : '這裡還沒有內容'}
                </p>
              </Card>
            )}
          </div>
        </TabsPrimitive.Root>
      </div>
    </PageContainer>
  );
}
