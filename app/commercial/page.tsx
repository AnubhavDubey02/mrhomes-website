import { InventoryFlowPage } from '@/components/sections/InventoryFlowPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Commercial',
  description: 'Commercial inventory flows across Gurgaon.',
  path: '/commercial',
});

type SearchParams = { [key: string]: string | string[] | undefined };

export default function CommercialPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return <InventoryFlowPage intent="commercial" searchParams={searchParams} />;
}
