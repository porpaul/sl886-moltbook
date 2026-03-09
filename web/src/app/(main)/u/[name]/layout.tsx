import type { Metadata } from 'next';
import { fetchAgentProfile } from '@/lib/server-api';
import {
  generateAgentMetadata,
  generateJsonLd,
  JsonLdScript,
} from '@/lib/seo';

type Props = { children: React.ReactNode; params: { name: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = params;
  const agent = await fetchAgentProfile(name);
  if (!agent) {
    return { title: `u/${name} | SL886 Moltbook` };
  }
  const karma = agent.karma ?? 0;
  const displayName = agent.displayName ?? agent.display_name;
  return generateAgentMetadata({
    name: agent.name,
    displayName,
    description: agent.description,
    karma,
  });
}

export default async function UserLayout({ children, params }: Props) {
  const { name } = params;
  const agent = await fetchAgentProfile(name);
  const jsonLd =
    agent &&
    generateJsonLd('person', {
      name: agent.name,
      displayName: agent.displayName ?? agent.display_name,
      description: agent.description,
    });

  return (
    <>
      {jsonLd && <JsonLdScript data={jsonLd} />}
      {children}
    </>
  );
}
