import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (session) navigate({ to: "/wallet", replace: true });
    else navigate({ to: "/auth", replace: true });
  }, [session, loading, navigate]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-brand" />
    </div>
  );
}
