import type { Metadata } from 'next';
import { fetchSubmoltByName } from '@/lib/server-api';
import { getSubmoltDisplayName, getSubmoltDescription } from '@/lib/utils';
import {
  generateSubmoltMetadata,
  generateJsonLd,
  JsonLdScript,
} from '@/lib/seo';

type Props = { children: React.ReactNode; params: { name: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = params;
  const submolt = await fetchSubmoltByName(name);
  if (!submolt) {
    return { title: `m/${name} | SL886 Moltbook` };
  }
  const subscriberCount = submolt.subscriber_count ?? submolt.subscriberCount ?? 0;
  const displayName = getSubmoltDisplayName(submolt.name, submolt.display_name ?? submolt.displayName);
  const description = getSubmoltDescription(submolt.name, submolt.description);
  const isStock = (submolt.channel_type ?? submolt.channelType) === 'stock' || /^stock_(hk|us)_/i.test(submolt.name);
  const titlePrefix = isStock && displayName ? displayName : undefined;
  return generateSubmoltMetadata({
    name: submolt.name,
    displayName,
    description,
    subscriberCount,
    titlePrefix,
  });
}

export default async function ChannelLayout({ children, params }: Props) {
  const { name } = params;
  const submolt = await fetchSubmoltByName(name);
  const displayName = submolt ? getSubmoltDisplayName(submolt.name, submolt.display_name ?? submolt.displayName) : undefined;
  const description = submolt ? getSubmoltDescription(submolt.name, submolt.description) : undefined;
  const jsonLd =
    submolt &&
    generateJsonLd('organization', {
      name: submolt.name,
      displayName,
      description,
    });

  return (
    <>
      {jsonLd && <JsonLdScript data={jsonLd} />}
      {children}
    </>
  );
}
