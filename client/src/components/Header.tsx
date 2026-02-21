export function Header() {
  return (
    <div className="flex justify-between items-center px-6 pt-4 pb-2">
      <h1 className="text-base font-semibold tracking-tight text-foreground/90">BrainDump</h1>
      <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
    </div>
  );
}
