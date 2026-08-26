import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-10 max-[980px]:px-4 max-[980px]:py-6">
      <Skeleton className="mb-6 h-4 w-64" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr_220px]">
        <Skeleton className="h-[380px]" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
      </div>

      <Skeleton className="mt-10 h-48 w-full" />
    </div>
  );
}
