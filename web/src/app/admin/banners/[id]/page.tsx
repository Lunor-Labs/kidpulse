import { EditBannerClient } from './EditClient';

export const metadata = { title: 'Edit banner' };

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditBannerClient id={id} />;
}
