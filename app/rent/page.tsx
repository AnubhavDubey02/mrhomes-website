import { InventoryFlowPage } from '@/components/sections/InventoryFlowPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Rent',
  description: 'Rental inventory flows across Gurgaon.',
  path: '/rent',
});

type SearchParams = { [key: string]: string | string[] | undefined };

export default function RentPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return <InventoryFlowPage intent="rent" searchParams={searchParams} />;
}
