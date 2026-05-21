import { notFound } from 'next/navigation';
import { InventoryCategoryPage } from '@/components/sections/InventoryCategoryPage';
import {
  BUY_CATEGORIES,
  getCategory,
  type InventoryIntent,
} from '@/lib/inventory-flows';
import { buildMetadata } from '@/lib/seo';

const intent: InventoryIntent = 'buy';

export function generateStaticParams() {
  return BUY_CATEGORIES.map((category) => ({ category: category.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const category = getCategory(intent, params.category);
  if (!category) {
    return buildMetadata({
      title: 'Buy',
      description: '',
      path: `/buy/${params.category}`,
    });
  }
  return buildMetadata({
    title: category.label,
    description: category.description,
    path: `/buy/${category.slug}`,
  });
}

export default function BuyCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = getCategory(intent, params.category);
  if (!category) notFound();
  return <InventoryCategoryPage intent={intent} category={category} />;
}
