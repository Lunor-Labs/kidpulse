import { EditProductBannerClient } from './EditClient';

export const metadata = { title: 'Edit product banner' };

export default async function EditProductBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProductBannerClient id={id} />;
}
