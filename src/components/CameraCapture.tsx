import { useEffect, useRef, useState } from "react";
import { X, Camera, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  side: "front" | "back";
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ side, onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch (err) {
        toast.error("Caméra indisponible", {
          description: err instanceof Error ? err.message : "Autorise l'accès à la caméra.",
        });
        onClose();
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onClose]);

  function snap() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setPreview(canvas.toDataURL("image/jpeg", 0.92));
  }

  function confirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `${side}-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div
        className="flex items-center justify-between px-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
          {side === "front" ? "Recto" : "Verso"}
        </span>
        <div className="h-11 w-11" />
      </div>

      <div className="relative flex-1 overflow-hidden">
        {preview ? (
          <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
          />
        )}

        {/* Card outline overlay (ISO/IEC 7810 ID-1, ratio 85.60 × 53.98 ≈ 1.586) */}
        {!preview && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="relative"
              style={{ width: "88%", aspectRatio: "1.586 / 1" }}
            >
              <div className="absolute inset-0 rounded-3xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
              {/* corner accents */}
              {["top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl",
                "top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl",
                "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl",
                "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl"].map((c) => (
                <span key={c} className={`absolute h-8 w-8 border-brand ${c}`} />
              ))}
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-white/90">
                Aligne la carte dans le cadre
              </span>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div
        className="flex items-center justify-around bg-black/80 px-6 py-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
      >
        {preview ? (
          <>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="flex h-14 items-center gap-2 rounded-full bg-white/10 px-6 text-white font-medium"
            >
              <RefreshCw size={18} />
              Reprendre
            </button>
            <button
              type="button"
              onClick={confirm}
              className="flex h-14 items-center gap-2 rounded-full bg-brand px-6 text-brand-foreground font-semibold"
            >
              <Check size={18} />
              Utiliser
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={snap}
            disabled={!ready}
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 disabled:opacity-50"
            aria-label="Prendre la photo"
          >
            <span className="h-14 w-14 rounded-full bg-white" />
            <Camera className="sr-only" />
          </button>
        )}
      </div>
    </div>
  );
}
