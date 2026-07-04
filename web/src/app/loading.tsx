import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <Skeleton className="h-72 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
