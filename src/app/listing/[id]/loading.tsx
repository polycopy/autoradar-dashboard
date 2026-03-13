export default function ListingLoading() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="h-4 w-48 bg-surface-2 rounded animate-pulse" />
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="aspect-[4/3] bg-surface-2 animate-pulse" />
          <div className="p-8 space-y-6">
            <div className="h-8 w-64 bg-surface-2 rounded animate-pulse" />
            <div className="h-24 bg-surface-2 rounded-xl animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-surface-2 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
