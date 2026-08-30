export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src="/loading-logo.png"
            alt="Memuat..."
            className="w-20 h-20 animate-pulse"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/80 border-t-red-600 rounded-full animate-spin" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Memuat...</p>
      </div>
    </div>
  );
}
