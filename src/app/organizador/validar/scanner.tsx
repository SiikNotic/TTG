"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, RotateCcw } from "lucide-react";
import { scanTicket, type ScanResult, type ScanResultCode } from "@/lib/actions/scan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CameraState = "idle" | "starting" | "scanning" | "denied" | "unavailable";

const RESULT_INFO: Record<
  ScanResultCode,
  { label: string; tone: "success" | "warning" | "danger"; icon: typeof CheckCircle2 }
> = {
  VALIDO: { label: "VÁLIDO", tone: "success", icon: CheckCircle2 },
  YA_UTILIZADO: { label: "YA UTILIZADO", tone: "warning", icon: AlertTriangle },
  CANCELADO: { label: "CANCELADO", tone: "danger", icon: XCircle },
  REEMBOLSADO: { label: "REEMBOLSADO", tone: "danger", icon: XCircle },
  EXPIRADO: { label: "EXPIRADO", tone: "warning", icon: AlertTriangle },
  INVALIDO: { label: "INVÁLIDO", tone: "danger", icon: ShieldAlert },
  EVENTO_INCORRECTO: { label: "EVENTO INCORRECTO", tone: "danger", icon: ShieldAlert },
  ERROR: { label: "ERROR DE CONEXIÓN", tone: "danger", icon: AlertTriangle },
};

const TONE_CLASSES: Record<"success" | "warning" | "danger", string> = {
  success: "bg-success-600 text-white",
  warning: "bg-warning-600 text-white",
  danger: "bg-danger-600 text-white",
};

function Scanner({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scanLockRef = useRef(false); // evita disparar dos escaneos por el mismo frame/decode

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [pending, setPending] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const submitToken = useCallback(
    async (token: string) => {
      if (scanLockRef.current) return;
      scanLockRef.current = true;
      setPending(true);
      try {
        const res = await scanTicket(eventId, token);
        setResult(res);
      } finally {
        setPending(false);
      }
    },
    [eventId]
  );

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(frame.data, frame.width, frame.height);

    if (code?.data && !scanLockRef.current) {
      void submitToken(code.data);
      return; // no seguir pidiendo frames mientras se muestra el resultado
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [submitToken]);

  async function startCamera() {
    setResult(null);
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("scanning");
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setCameraState(
        err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "unavailable"
      );
    }
  }

  function scanNext() {
    setResult(null);
    scanLockRef.current = false;
    if (cameraState === "scanning") {
      rafRef.current = requestAnimationFrame(tick);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualToken.trim() || pending) return;
    scanLockRef.current = false;
    await submitToken(manualToken.trim());
    setManualToken("");
  }

  const info = result ? RESULT_INFO[result.code] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-neutral-950">
        <video ref={videoRef} className="size-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {cameraState !== "scanning" && !result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            {cameraState === "denied" || cameraState === "unavailable" ? (
              <>
                <CameraOff className="size-8 text-white/70" />
                <p className="text-sm text-white/80">
                  {cameraState === "denied"
                    ? "No se pudo acceder a la cámara. Revisa los permisos del navegador."
                    : "No hay cámara disponible en este dispositivo."}
                </p>
                <p className="text-xs text-white/60">Puedes seguir validando con el código escrito abajo.</p>
              </>
            ) : (
              <Button type="button" onClick={startCamera} disabled={cameraState === "starting"}>
                <Camera className="size-4" />
                {cameraState === "starting" ? "Activando…" : "Activar cámara"}
              </Button>
            )}
          </div>
        )}

        {result && info && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center ${TONE_CLASSES[info.tone]}`}>
            <info.icon className="size-16" strokeWidth={1.5} />
            <p className="text-2xl font-bold tracking-tight">{info.label}</p>
            {result.serial && (
              <div className="text-sm opacity-90">
                <p className="font-mono">{result.serial}</p>
                {result.ticketTypeName && <p>{result.ticketTypeName}</p>}
              </div>
            )}
            <Button type="button" variant="secondary" onClick={scanNext}>
              <RotateCcw className="size-4" /> Escanear siguiente
            </Button>
          </div>
        )}

        {pending && !result && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">
            Verificando…
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Evento: <span className="font-medium text-foreground">{eventTitle}</span>
      </p>

      <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
        <Label htmlFor="manual-token">O escribe / pega el código manualmente</Label>
        <div className="flex gap-2">
          <Input
            id="manual-token"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            autoComplete="off"
            placeholder="Código del ticket"
          />
          <Button type="submit" variant="outline" disabled={pending || !manualToken.trim()}>
            Validar
          </Button>
        </div>
      </form>
    </div>
  );
}

export { Scanner };
