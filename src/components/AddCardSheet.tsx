import { useRef, useState } from "react";
import { X, Upload, Loader2, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CameraCapture from "@/components/CameraCapture";

const SUGGESTIONS = [
  "Carte de bus",
  "Carte de train",
  "Carte d'identité",
  "Permis de conduire",
  "Carte étudiante",
  "Carte vitale",
  "Carte de fidélité",
];

interface Props {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddCardSheet({ userId, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState<"front" | "back" | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File, cardId: string, side: "front" | "back") {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${cardId}/${side}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("card-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return path;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Donne un nom à ta carte");
      return;
    }
    setBusy(true);
    try {
      const { data: card, error } = await supabase
        .from("cards")
        .insert({ user_id: userId, name: name.trim(), type: type.trim() || null })
        .select()
        .single();
      if (error) throw error;

      const updates: { front_image_url?: string; back_image_url?: string } = {};
      if (front) updates.front_image_url = await uploadImage(front, card.id, "front");
      if (back) updates.back_image_url = await uploadImage(back, card.id, "back");

      if (Object.keys(updates).length) {
        const { error: upErr } = await supabase.from("cards").update(updates).eq("id", card.id);
        if (upErr) throw upErr;
      }

      toast.success("Carte ajoutée");
      onCreated();
      onClose();
    } catch (err) {
      toast.error("Impossible d'ajouter", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="w-full max-w-[480px] max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Nouvelle carte</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-5 pb-8 pt-5">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Ma carte de bus"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Type
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type de carte (libre)"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
              list="card-suggestions"
            />
            <datalist id="card-suggestions">
              {SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setType(s)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    type === s
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                  style={{ minHeight: "auto" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["front", "back"] as const).map((side) => {
              const file = side === "front" ? front : back;
              const ref = side === "front" ? frontRef : backRef;
              const setFile = side === "front" ? setFront : setBack;
              return (
                <div key={side}>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {side === "front" ? "Recto" : "Verso"}
                  </label>
                  <input
                    ref={ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => setCamera(side)}
                    className="mt-2 flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background text-muted-foreground overflow-hidden"
                  >
                    {file ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <Camera size={20} />
                        <span className="text-[11px]">Photo</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    className="mt-2 flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground"
                    style={{ minHeight: "auto" }}
                  >
                    <ImageIcon size={12} />
                    Galerie
                  </button>
                </div>
              );
            })}
          </div>

          {camera && (
            <CameraCapture
              side={camera}
              onCapture={(f) => (camera === "front" ? setFront(f) : setBack(f))}
              onClose={() => setCamera(null)}
            />
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-brand-foreground font-semibold shadow-sm active:scale-[0.98] transition disabled:opacity-60"
          >
            {busy ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
