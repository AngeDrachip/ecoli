import { useState } from "react";
import { X, RotateCw } from "lucide-react";

interface Props {
  name: string;
  type?: string | null;
  frontUrl?: string | null;
  backUrl?: string | null;
  onClose: () => void;
}

export default function CardDetailSheet({ name, type, frontUrl, backUrl, onClose }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [showBoth, setShowBoth] = useState(true);

  const CardFace = ({ url, label }: { url?: string | null; label: string }) => (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
      {url ? (
        <img src={url} alt={label} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand/60 text-brand-foreground font-display">
          {label}
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
        {label}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md">
      <div
        className="flex items-center justify-between px-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
      >
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-semibold text-foreground">{name}</h2>
          {type && <p className="truncate text-xs text-muted-foreground">{type}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBoth((v) => !v)}
            className="rounded-full border border-border bg-card/60 px-3 text-xs font-medium text-muted-foreground"
          >
            {showBoth ? "3D" : "Les deux"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
        {showBoth ? (
          <div className="space-y-5">
            <CardFace url={frontUrl} label="Recto" />
            <CardFace url={backUrl} label="Verso" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-4">
            <div
              className="relative w-full"
              style={{ perspective: "1400px" }}
            >
              <div
                className="relative aspect-[16/10] w-full transition-transform duration-700"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  <CardFace url={frontUrl} label="Recto" />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <CardFace url={backUrl} label="Verso" />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              className="mt-8 flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-6 text-brand-foreground font-semibold shadow-sm active:scale-[0.98] transition"
            >
              <RotateCw size={18} />
              Retourner
            </button>
            <p className="mt-3 text-xs text-muted-foreground">Touche pour retourner la carte</p>
          </div>
        )}
      </div>
    </div>
  );
}
