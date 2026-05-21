import { notFound } from 'next/navigation';
import { InventoryCategoryPage } from '@/components/sections/InventoryCategoryPage';
import {
  RENT_CATEGORIES,
  getCategory,
  type InventoryIntent,
} from '@/lib/inventory-flows';
import { buildMetadata } from '@/lib/seo';

const intent: InventoryIntent = 'rent';

export function generateStaticParams() {
  return RENT_CATEGORIES.map((category) => ({ category: category.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const category = getCategory(intent, params.category);
  if (!category) {
    return buildMetadata({
      title: 'Rent',
      description: '',
      path: `/rent/${params.category}`,
    });
  }
  return buildMetadata({
    title: `${category.label} Rentals`,
    description: category.description,
    path: `/rent/${category.slug}`,
  });
}

export default function RentCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = getCategory(intent, params.category);
  if (!category) notFound();
  return <InventoryCategoryPage intent={intent} category={category} />;
}
