import { redirect } from 'next/navigation';

export default function MoltbookStockRedirectPage({
  params
}: {
  params: { market: string; symbol: string };
}) {
  const { market, symbol } = params;
  redirect(`/stock/${encodeURIComponent(market)}/${encodeURIComponent(symbol)}`);
}
