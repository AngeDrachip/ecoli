import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type Provider = "google" | "apple" | "discord" | "spotify" | "snapchat";

interface Props {
  provider: Provider;
  label: string;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

const PROVIDER_STYLES: Record<Provider, { bg: string; fg: string; ring?: string }> = {
  google: { bg: "bg-white", fg: "text-[#1f1f1f]" },
  apple: { bg: "bg-black dark:bg-white", fg: "text-white dark:text-black" },
  discord: { bg: "bg-[#5865F2]", fg: "text-white" },
  spotify: { bg: "bg-[#1DB954]", fg: "text-black" },
  snapchat: { bg: "bg-[#FFFC00]", fg: "text-black" },
};

export default function ProviderButton({
  provider,
  label,
  onClick,
  busy,
  disabled,
  comingSoon,
}: Props) {
  const s = PROVIDER_STYLES[provider];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={`relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl px-5 text-[15px] font-semibold shadow-sm transition active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 ${s.bg} ${s.fg}`}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ProviderIcon provider={provider} />}
      </span>
      <span>{label}</span>
      {comingSoon && (
        <span className="absolute right-3 rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider dark:bg-white/10">
          bientôt
        </span>
      )}
    </button>
  );
}

function ProviderIcon({ provider }: { provider: Provider }): ReactNode {
  switch (provider) {
    case "google":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden>
          <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.3z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.28-1.93-6.15-4.53H2.16v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.85 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.35-2.12V7.04H2.16A11 11 0 0 0 1 12c0 1.77.42 3.45 1.16 4.96l3.69-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.04l3.69 2.84C6.72 7.3 9.14 5.38 12 5.38z" />
        </svg>
      );
    case "apple":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden>
          <path d="M16.37 12.6c-.02-2.36 1.92-3.49 2.01-3.55-1.09-1.6-2.8-1.82-3.4-1.85-1.44-.15-2.83.85-3.57.85-.75 0-1.88-.83-3.1-.81-1.6.02-3.08.93-3.9 2.36-1.66 2.88-.42 7.14 1.2 9.48.79 1.14 1.73 2.42 2.96 2.38 1.19-.05 1.63-.77 3.07-.77 1.44 0 1.84.77 3.1.75 1.28-.02 2.09-1.16 2.87-2.31.9-1.32 1.28-2.61 1.3-2.67-.03-.01-2.48-.95-2.54-3.86zM14.03 5.24c.66-.8 1.11-1.9.99-3.01-.95.04-2.11.63-2.8 1.43-.62.71-1.16 1.85-1.02 2.93 1.06.08 2.15-.54 2.83-1.35z" />
        </svg>
      );
    case "discord":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden>
          <path d="M20.32 4.37A19.8 19.8 0 0 0 15.5 3l-.24.5c1.8.4 2.63.98 3.53 1.7-1.53-.78-3.05-1.5-5.79-1.5-2.74 0-4.25.72-5.79 1.5.9-.72 1.9-1.38 3.53-1.7L10.5 3a19.8 19.8 0 0 0-4.82 1.37C2.83 8.6 2.06 12.72 2.44 16.78c2 1.47 3.93 2.36 5.85 2.94l.55-1.24c-.9-.29-1.87-.7-2.79-1.25.23-.16.46-.33.68-.5 3.83 1.75 8.14 1.75 11.94 0 .22.17.45.34.68.5-.92.55-1.9.96-2.79 1.25l.55 1.24c1.92-.58 3.85-1.47 5.85-2.94.44-4.72-.75-8.8-3.24-12.41zM9.13 14.66c-1.15 0-2.09-1.05-2.09-2.34s.92-2.34 2.09-2.34c1.17 0 2.11 1.06 2.09 2.34 0 1.29-.92 2.34-2.09 2.34zm5.74 0c-1.15 0-2.09-1.05-2.09-2.34s.92-2.34 2.09-2.34c1.17 0 2.11 1.06 2.09 2.34 0 1.29-.92 2.34-2.09 2.34z" />
        </svg>
      );
    case "spotify":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.42a.62.62 0 0 1-.86.21c-2.36-1.44-5.32-1.77-8.82-.97a.62.62 0 1 1-.28-1.22c3.83-.87 7.11-.5 9.75 1.12.3.18.4.57.21.86zm1.23-2.73a.78.78 0 0 1-1.07.26c-2.7-1.66-6.82-2.14-10.02-1.17a.78.78 0 1 1-.45-1.5c3.65-1.1 8.19-.56 11.28 1.34.36.22.48.7.26 1.07zm.11-2.85c-3.24-1.93-8.59-2.1-11.68-1.17a.94.94 0 1 1-.54-1.8c3.54-1.06 9.44-.86 13.16 1.36a.94.94 0 1 1-.94 1.62z" />
        </svg>
      );
    case "snapchat":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden>
          <path d="M12 2c3.3 0 5.5 2.4 5.5 5.7 0 1.5-.1 2.4-.2 2.9.4.2.9.3 1.3.3.5 0 1-.2 1.3-.2.4 0 .8.2.9.6.1.5-.4.9-1.3 1.3-.7.3-1.6.4-1.7.7-.1.3.5 1 1.4 1.9.9.9 2.3 1.5 2.3 2.1 0 .7-1.6.9-2.2 1.1-.3.1-.4.4-.5.7-.1.4-.2.9-.6 1-.3.1-.9-.1-1.5-.1-.8 0-1.6.1-2.3.5-.7.4-1.4 1.4-2.9 1.4s-2.2-1-2.9-1.4c-.7-.4-1.5-.5-2.3-.5-.6 0-1.2.2-1.5.1-.4-.1-.5-.6-.6-1-.1-.3-.2-.6-.5-.7-.6-.2-2.2-.4-2.2-1.1 0-.6 1.4-1.2 2.3-2.1.9-.9 1.5-1.6 1.4-1.9-.1-.3-1-.4-1.7-.7-.9-.4-1.4-.8-1.3-1.3.1-.4.5-.6.9-.6.3 0 .8.2 1.3.2.4 0 .9-.1 1.3-.3-.1-.5-.2-1.4-.2-2.9C6.5 4.4 8.7 2 12 2z" />
        </svg>
      );
  }
}
