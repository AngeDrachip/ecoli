import { Leaf } from "lucide-react";

export default function EcoliLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const iconSize = size === "sm" ? 18 : 22;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
        <Leaf size={iconSize} strokeWidth={2.4} />
      </div>
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        Ecoli
      </span>
    </div>
  );
}
