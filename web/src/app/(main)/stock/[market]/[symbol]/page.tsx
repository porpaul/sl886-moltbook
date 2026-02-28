'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function StockChannelPage() {
  const params = useParams<{ market: string; symbol: string }>();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const submolt = await api.getStockSubmolt(params.market, params.symbol);
        router.replace(`/m/${submolt.name}`);
      } catch {
        router.replace('/');
      }
    }
    void load();
  }, [params.market, params.symbol, router]);

  return (
    <div className="py-8 text-center text-muted-foreground">
      正在載入股票頻道...
    </div>
  );
}
