import { Battery, Wifi, Signal } from "lucide-react";

export function Header() {
  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-2 text-xs font-medium text-muted-foreground select-none">
      <span>9:41</span>
      <div className="flex gap-2 items-center">
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <Battery className="w-4 h-4" />
      </div>
    </div>
  );
}
