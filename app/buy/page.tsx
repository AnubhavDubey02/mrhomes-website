import { InventoryFlowPage } from '@/components/sections/InventoryFlowPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Buy',
  description: 'Buying inventory flows across Gurgaon.',
  path: '/buy',
});

type SearchParams = { [key: string]: string | string[] | undefined };

export default function BuyPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return <InventoryFlowPage intent="buy" searchParams={searchParams} />;
}
