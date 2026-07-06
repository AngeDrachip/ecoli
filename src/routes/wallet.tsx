import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, Plus, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import EcoliLogo from "@/components/EcoliLogo";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
});

function WalletPage() {
  const { user, session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, resolved } = useTheme();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [session, loading, navigate]);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "";

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="container-mobile flex items-center justify-between pt-8">
        <EcoliLogo size="sm" />
        <div className="flex items-center gap-2">
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

      <main className="container-mobile pb-24 pt-8">
        <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
          Bonjour{displayName ? `, ${displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toutes tes cartes, au même endroit.
        </p>

        <section className="mt-8">
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
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="container-mobile flex py-3">
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-brand-foreground font-semibold shadow-sm active:scale-[0.98] transition"
          >
            <Plus size={20} />
            Ajouter une carte
          </button>
        </div>
      </div>
    </div>
  );
}
