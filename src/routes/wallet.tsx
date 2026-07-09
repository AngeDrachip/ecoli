import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LogOut, Plus, Wallet, Trash2, Nfc, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import EcoliLogo from "@/components/EcoliLogo";
import AddCardSheet from "@/components/AddCardSheet";
import AccountsSheet from "@/components/AccountsSheet";
import CardDetailSheet from "@/components/CardDetailSheet";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
});

type CardRow = {
  id: string;
  name: string;
  type: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
};

function WalletPage() {
  const { user, session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, resolved } = useTheme();
  const [cards, setCards] = useState<CardRow[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [session, loading, navigate]);

  const loadCards = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    const cacheKey = `ecoli:cards:${user.id}`;
    const urlsKey = `ecoli:urls:${user.id}`;

    // Hydrate from local cache immediately (offline-first)
    try {
      const cached = localStorage.getItem(cacheKey);
      const cachedUrls = localStorage.getItem(urlsKey);
      if (cached) setCards(JSON.parse(cached));
      if (cachedUrls) setSignedUrls(JSON.parse(cachedUrls));
    } catch {}

    const { data, error } = await supabase
      .from("cards")
      .select("id,name,type,front_image_url,back_image_url")
      .order("created_at", { ascending: false });
    if (error) {
      if (!navigator.onLine) {
        toast("Mode hors ligne", { description: "Cartes chargées depuis le cache local." });
      } else {
        toast.error("Erreur de chargement", { description: error.message });
      }
      setFetching(false);
      return;
    }
    setCards(data ?? []);
    try { localStorage.setItem(cacheKey, JSON.stringify(data ?? [])); } catch {}

    const paths = (data ?? [])
      .map((c) => c.front_image_url)
      .filter((p): p is string => !!p);
    if (paths.length) {
      const { data: signed } = await supabase.storage
        .from("card-images")
        .createSignedUrls(paths, 3600);
      const map: Record<string, string> = {};
      signed?.forEach((s) => {
        if (s.path && s.signedUrl) map[s.path] = s.signedUrl;
      });
      setSignedUrls(map);
      try { localStorage.setItem(urlsKey, JSON.stringify(map)); } catch {}
    } else {
      setSignedUrls({});
      try { localStorage.removeItem(urlsKey); } catch {}
    }
    setFetching(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadCards();
    // Realtime sync across devices
    const channel = supabase
      .channel(`cards:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards", filter: `user_id=eq.${user.id}` },
        () => loadCards(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadCards]);

  async function deleteCard(card: CardRow) {
    if (!confirm(`Supprimer "${card.name}" ?`)) return;
    const paths = [card.front_image_url, card.back_image_url].filter(
      (p): p is string => !!p,
    );
    if (paths.length) await supabase.storage.from("card-images").remove(paths);
    const { error } = await supabase.from("cards").delete().eq("id", card.id);
    if (error) {
      toast.error("Suppression impossible", { description: error.message });
      return;
    }
    toast.success("Carte supprimée");
    setCards((c) => c.filter((x) => x.id !== card.id));
  }

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "";

  return (
    <div className="min-h-[100dvh] bg-background">
      <header
        className="container-mobile flex items-center justify-between"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
      >
        <EcoliLogo size="sm" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAccounts(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground"
            aria-label="Comptes liés"
          >
            <UserCircle2 size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              setTheme(theme === "system" ? (resolved === "dark" ? "light" : "dark") : theme === "dark" ? "light" : "system")
            }
            className="rounded-full border border-border bg-card/60 px-3 text-xs font-medium text-muted-foreground"
            aria-label="Changer le thème"
          >
            {theme === "system" ? "Auto" : theme === "dark" ? "Sombre" : "Clair"}
          </button>
          <button
            type="button"
            onClick={() => signOut().then(() => navigate({ to: "/auth", replace: true }))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground"
            aria-label="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="container-mobile pb-28 pt-8">
        <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
          Bonjour{displayName ? `, ${displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toutes tes cartes, au même endroit.
        </p>

        <section className="mt-8 space-y-3">
          {fetching ? (
            <div className="h-40 rounded-3xl border border-border bg-card/40 animate-pulse" />
          ) : cards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Wallet size={26} />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
                Aucune carte pour l'instant
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajoute ta première carte de transport ou d'identité.
              </p>
            </div>
          ) : (
            cards.map((card) => {
              const preview = card.front_image_url && signedUrls[card.front_image_url];
              return (
                <div
                  key={card.id}
                  className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt={card.name}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[16/10] w-full bg-gradient-to-br from-brand to-brand/60" />
                  )}
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <div className="truncate font-display font-semibold text-foreground">
                        {card.name}
                      </div>
                      {card.type && (
                        <div className="truncate text-xs text-muted-foreground">
                          {card.type}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          toast("Copier la puce NFC — bientôt", {
                            description:
                              "La copie de puce NFC arrive prochainement sur Ecoli.",
                          })
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-full text-brand"
                        aria-label="Copier la puce NFC (bientôt)"
                      >
                        <Nfc size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCard(card)}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="container-mobile flex py-3">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-brand-foreground font-semibold shadow-sm active:scale-[0.98] transition"
          >
            <Plus size={20} />
            Ajouter une carte
          </button>
        </div>
      </div>

      {showAccounts && <AccountsSheet onClose={() => setShowAccounts(false)} />}
      {showAdd && user && (
        <AddCardSheet
          userId={user.id}
          onClose={() => setShowAdd(false)}
          onCreated={loadCards}
        />
      )}
    </div>
  );
}
