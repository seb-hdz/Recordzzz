import { onCleanup, onMount } from "solid-js";
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

export interface BarcodeCameraProps {
  onDetected: (code: string) => void;
  onBack: () => void;
}

const SCANNER_ID = "step5-barcode-scanner";

export default function BarcodeCamera(props: BarcodeCameraProps) {
  let scanner: Html5Qrcode | null = null;
  let stopped = false;

  const stopScanner = async () => {
    if (!scanner || stopped) return;
    stopped = true;
    try {
      const state = scanner.getState();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // ignore stop errors
    }
    scanner = null;
  };

  onMount(() => {
    const start = async () => {
      scanner = new Html5Qrcode(SCANNER_ID, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777,
          },
          async (decodedText) => {
            const code = decodedText.trim();
            if (!code) return;
            await stopScanner();
            props.onDetected(code);
          },
          () => {
            /* ignore scan failures */
          }
        );
      } catch (err) {
        console.error("No se pudo iniciar la cámara:", err);
      }
    };

    void start();
  });

  onCleanup(() => {
    void stopScanner();
  });

  return (
    <div class="flex flex-col gap-4 px-4 mt-6">
      <button
        type="button"
        class="size-12 rounded-full bg-primary question-shadow flex items-center justify-center hover:cursor-pointer self-start text-primary-foreground"
        onClick={() => {
          void stopScanner().then(() => props.onBack());
        }}
        aria-label="Volver"
      >
        <span class="font-ultra text-2xl leading-none rotate-180 inline-block">
          →
        </span>
      </button>
      <div
        id={SCANNER_ID}
        class="w-full overflow-hidden rounded-3xl question-shadow bg-surface min-h-64"
      />
      <p class="font-cutive text-sm text-muted-foreground text-center">
        Apunta al código de barras para escanearlo
      </p>
    </div>
  );
}
