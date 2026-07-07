import { useEffect, useState } from "react";
import { X, Link2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProviderButton from "@/components/ProviderButton";

type ProviderKey = "google" | "apple" | "discord" | "spotify" | "snapchat";

interface Props {
  onClose: () => void;
}

const NATIVE = ["google", "apple"] as const;
const SOON = ["discord", "spotify", "snapchat"] as const;

const LABEL: Record<ProviderKey, string> = {
  google: "Google",
  apple: "Apple",
  discord: "Discord",
  spotify: "Spotify",
  snapchat: "Snapchat",
};

export default function AccountsSheet({ onClose }: Props) {
  const [linked, setLinked] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUserIdentities();
      setLinked((data?.identities ?? []).map((i) => i.provider));
      setLoading(false);
    })();
  }, []);

  async function link(provider: "google" | "apple") {
    setBusy(provider);
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo: window.location.origin + "/wallet" },
      });
      if (error) throw error;
    } catch (e) {
      toast.error("Impossible de lier", {
        description: e instanceof Error ? e.message : String(e),
      });
      setBusy(null);
    }
  }

  async function unlink(provider: string) {
    if (linked.length <= 1) {
      toast.error("Impossible", { description: "Garde au moins un compte lié." });
      return;
    }
    if (!confirm(`Délier ${LABEL[provider as ProviderKey] ?? provider} ?`)) return;
    const { data } = await supabase.auth.getUserIdentities();
    const identity = data?.identities?.find((i) => i.provider === provider);
    if (!identity) return;
    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    setLinked((l) => l.filter((p) => p !== provider));
    toast.success("Compte délié");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="w-full max-w-[480px] max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Comptes liés
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 px-5 pb-8 pt-5">
          <p className="text-sm text-muted-foreground">
            Lie plusieurs fournisseurs à un même compte pour te connecter comme tu veux.
          </p>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {NATIVE.map((p) => {
                const isLinked = linked.includes(p);
                return (
                  <div key={p} className="flex items-center gap-2">
                    <div className="flex-1">
                      <ProviderButton
                        provider={p}
                        label={isLinked ? `${LABEL[p]} — lié` : `Lier ${LABEL[p]}`}
                        onClick={() => (isLinked ? unlink(p) : link(p))}
                        busy={busy === p}
                        disabled={!!busy}
                      />
                    </div>
                    {isLinked && (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="relative py-3">
                <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                <div className="relative mx-auto w-fit bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Bientôt
                </div>
              </div>

              {SOON.map((p) => (
                <ProviderButton
                  key={p}
                  provider={p}
                  label={`Lier ${LABEL[p]}`}
                  onClick={() =>
                    toast(`${LABEL[p]} — bientôt disponible`, {
                      description: "Ce fournisseur sera activé prochainement.",
                    })
                  }
                  disabled
                  comingSoon
                />
              ))}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Link2 size={14} /> Astuce
            </div>
            <p className="mt-1">
              Utilise la même adresse e-mail sur chaque fournisseur pour retrouver
              automatiquement tes cartes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
