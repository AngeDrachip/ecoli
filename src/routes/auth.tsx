import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import EcoliLogo from "@/components/EcoliLogo";
import ProviderButton from "@/components/ProviderButton";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, resolved } = useTheme();
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/wallet", replace: true });
  }, [session, loading, navigate]);

  async function signIn(provider: "google" | "apple") {
    setBusy(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Impossible de se connecter", { description: result.error.message });
        setBusy(null);
        return;
      }
      // Sur mobile (Safari iOS notamment), redirected=true → le navigateur part
      // vers le provider. Sinon la session est déjà posée.
    } catch (e) {
      toast.error("Erreur de connexion", { description: e instanceof Error ? e.message : String(e) });
      setBusy(null);
    }
  }

  function unavailable(name: string) {
    toast(`${name} — non disponible`, {
      description:
        "Ce provider nécessite une configuration OAuth externe non exposée par Lovable Cloud. Contacte le support pour l'activer.",
    });
  }

  return (
    <div className="relative min-h-[100dvh] bg-background">
      {/* Halo décoratif discret */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, var(--brand-soft) 0%, transparent 70%)",
        }}
      />

      <div className="container-mobile relative flex min-h-[100dvh] flex-col pt-14 pb-8">
        <div className="flex items-center justify-between">
          <EcoliLogo />
          <button
            type="button"
            onClick={() =>
              setTheme(theme === "system" ? (resolved === "dark" ? "light" : "dark") : theme === "dark" ? "light" : "system")
            }
            className="rounded-full border border-border bg-card/60 px-3 text-xs font-medium text-muted-foreground backdrop-blur"
            aria-label="Changer le thème"
          >
            {theme === "system" ? "Auto" : theme === "dark" ? "Sombre" : "Clair"}
          </button>
        </div>

        <div className="mt-12">
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
            Ton portefeuille,
            <br />
            <span className="text-brand">simple et sûr.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Connecte-toi pour retrouver tes cartes de transport et d'identité,
            synchronisées sur tous tes appareils.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <ProviderButton
            provider="google"
            label="Continuer avec Google"
            onClick={() => signIn("google")}
            busy={busy === "google"}
            disabled={!!busy}
          />
          <ProviderButton
            provider="apple"
            label="Continuer avec Apple"
            onClick={() => signIn("apple")}
            busy={busy === "apple"}
            disabled={!!busy}
          />

          <div className="relative py-3">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div className="relative mx-auto w-fit bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Bientôt
            </div>
          </div>

          <ProviderButton
            provider="discord"
            label="Continuer avec Discord"
            onClick={() => unavailable("Discord")}
            disabled
            comingSoon
          />
          <ProviderButton
            provider="spotify"
            label="Continuer avec Spotify"
            onClick={() => unavailable("Spotify")}
            disabled
            comingSoon
          />
          <ProviderButton
            provider="snapchat"
            label="Continuer avec Snapchat"
            onClick={() => unavailable("Snapchat")}
            disabled
            comingSoon
          />
        </div>

        {loading && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        <p className="mt-auto pt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          En continuant, tu acceptes que tes cartes soient stockées de manière
          chiffrée et accessibles uniquement depuis ton compte.
        </p>
      </div>
    </div>
  );
}
