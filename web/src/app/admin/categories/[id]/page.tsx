import { EditCategoryClient } from './EditClient';

export const metadata = { title: 'Edit category' };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCategoryClient id={id} />;
}
