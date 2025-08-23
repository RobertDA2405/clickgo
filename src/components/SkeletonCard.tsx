export default function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm animate-pulse">
      <div className="bg-gray-200 rounded h-44 mb-3 w-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.2s_infinite]" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
