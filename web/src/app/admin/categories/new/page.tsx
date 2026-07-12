import { AccountCard } from '@/components/features/account/AccountCard';
import { CategoryForm } from '@/components/features/admin/CategoryForm';

export const metadata = { title: 'New category' };

export default function NewCategoryPage() {
  return (
    <AccountCard title="New category" subtitle="Add a new catalog category.">
      <CategoryForm />
    </AccountCard>
  );
}
