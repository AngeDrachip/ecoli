export default function EcoliLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  return (
    <div className="flex items-center gap-2">
      <img
        src="/apple-touch-icon-transparent.png"
        alt="Ecoli"
        className={`${box} rounded-2xl object-contain`}
        draggable={false}
      />
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        Ecoli
      </span>
    </div>
  );
}
