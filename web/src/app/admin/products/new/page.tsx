import { AccountCard } from '@/components/features/account/AccountCard';
import { ProductForm } from '@/components/features/admin/ProductForm';

export const metadata = { title: 'New product' };

export default function NewProductPage() {
  return (
    <AccountCard title="New product" subtitle="Add a new catalog product.">
      <ProductForm />
    </AccountCard>
  );
}
