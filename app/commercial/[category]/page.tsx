import { notFound } from 'next/navigation';
import { InventoryCategoryPage } from '@/components/sections/InventoryCategoryPage';
import {
  COMMERCIAL_CATEGORIES,
  getCategory,
  type InventoryIntent,
} from '@/lib/inventory-flows';
import { buildMetadata } from '@/lib/seo';

const intent: InventoryIntent = 'commercial';

export function generateStaticParams() {
  return COMMERCIAL_CATEGORIES.map((category) => ({ category: category.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const category = getCategory(intent, params.category);
  if (!category) {
    return buildMetadata({
      title: 'Commercial',
      description: '',
      path: `/commercial/${params.category}`,
    });
  }
  return buildMetadata({
    title: `Commercial ${category.label}`,
    description: category.description,
    path: `/commercial/${category.slug}`,
  });
}

export default function CommercialCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = getCategory(intent, params.category);
  if (!category) notFound();
  return <InventoryCategoryPage intent={intent} category={category} />;
}
