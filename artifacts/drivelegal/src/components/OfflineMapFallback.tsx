import { Map as MapIcon, WifiOff, MapPin } from "lucide-react";

interface OfflineMapFallbackProps {
  message?: string;
  className?: string;
}

export function OfflineMapFallback({ message = "Map data requires internet connection.", className }: OfflineMapFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-muted/30 rounded-xl border border-dashed p-12 text-center space-y-4 ${className}`}>
      <div className="relative">
        <MapIcon className="w-16 h-16 text-muted-foreground/20" />
        <WifiOff className="w-8 h-8 text-red-500 absolute -bottom-1 -right-1 bg-background rounded-full p-1 border shadow-sm" />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-foreground">Offline Map Mode</p>
        <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
          {message}
        </p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border text-[10px] font-mono text-muted-foreground">
        <MapPin className="w-3 h-3" />
        GPS TRACKING ACTIVE (OFFLINE)
      </div>
    </div>
  );
}
