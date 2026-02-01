interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

export function TaskSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded mt-1" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="w-5 h-5" />
      </div>
    </div>
  );
}

export function WorkoutSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200">
      <div className="flex items-center gap-3">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="flex-1 h-5" />
        <Skeleton className="w-5 h-5" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
