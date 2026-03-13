export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-48 bg-surface-2 rounded animate-pulse" />
        <div className="h-4 w-80 bg-surface-2 rounded animate-pulse mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border-subtle rounded-xl p-5 h-24 animate-pulse"
          />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border-subtle rounded-xl h-72 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
