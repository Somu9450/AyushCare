import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  AlertCircle,
} from "lucide-react";
import { useMobileStore } from "../../store/useMobileStore";
import {
  createDocumentPage,
  normalizeDocumentType,
} from "../../services/documentService";

export default function M3_DocumentCapture() {
  const {
    selectedDocumentType,
    documentType,
    capturedDocument,
    capturedDocuments,
    setCapturedDocument,
    setCapturedDocuments,
    setScreen,
  } = useMobileStore();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const type = normalizeDocumentType(
    selectedDocumentType ||
      documentType ||
      capturedDocument?.documentType
  );

  const existingPages =
    Array.isArray(capturedDocuments) &&
    capturedDocuments.length > 0
      ? capturedDocuments
      : Array.isArray(capturedDocument?.pages) &&
          capturedDocument.pages.length > 0
        ? capturedDocument.pages
        : capturedDocument
          ? [capturedDocument]
          : [];

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      setIsStarting(true);
      setCameraError("");

      try {
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error(
            "Camera access is not supported in this browser."
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: {
                ideal: "environment",
              },
            },
            audio: false,
          });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Do not wait for play() before displaying the camera.
          setCameraActive(true);

          try {
            await videoRef.current.play();
          } catch {
            // Some mobile browsers delay playback until interaction.
          }
        }
      } catch (error) {
        console.error("Camera initialization failed:", error);

        if (mounted) {
          setCameraError(
            error?.message ||
              "Camera access could not be started."
          );
          setCameraActive(false);
        }
      } finally {
        if (mounted) {
          setIsStarting(false);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setCameraActive(false);
  };

  const persistPages = (nextPages) => {
    const normalizedPages = nextPages.map(
      (page, index) => ({
        ...page,
        pageNumber: index + 1,
        documentType: type,
      })
    );

    /*
     * Keep the two existing store APIs synchronized.
     *
     * This is intentionally defensive because older store versions may
     * expose one or both of these setters.
     */
    if (typeof setCapturedDocuments === "function") {
      setCapturedDocuments(normalizedPages);
    }

    if (typeof setCapturedDocument === "function") {
      const firstPage = normalizedPages[0];

      if (!firstPage) {
        setCapturedDocument(null);
        return;
      }

      setCapturedDocument({
        ...(capturedDocument || {}),
        ...firstPage,
        id:
          capturedDocument?.id ||
          firstPage.id,

        documentId:
          capturedDocument?.documentId ||
          `document-${Date.now()}`,

        documentType: type,

        pages: normalizedPages,

        pageCount: normalizedPages.length,
      });
    }
  };

  const savePage = (source) => {
    const safeSource = source || {};

    /*
     * Keep every browser-displayable representation together. This is
     * important because the review screen and legacy store APIs may read
     * different fields. Strings are used for preview; File/Blob objects are
     * converted before they reach the store.
     */
    const preview =
      typeof safeSource.dataUrl === "string"
        ? safeSource.dataUrl
        : typeof safeSource.previewUrl === "string"
          ? safeSource.previewUrl
          : typeof safeSource.imageUrl === "string"
            ? safeSource.imageUrl
            : "";

    const normalizedSource = {
      ...safeSource,
      dataUrl: preview,
      previewUrl: preview,
      imageUrl: preview,
    };

    const page = createDocumentPage({
      source: normalizedSource,
      documentType: type,
      pageNumber: existingPages.length + 1,
    });

    /*
     * IMPORTANT:
     * Never use setCapturedDocument() as the only source of truth here.
     * It may reset capturedDocuments in older store implementations.
     *
     * We therefore build the complete collection first.
     */
    const nextPages = [
      ...existingPages,
      page,
    ];

    persistPages(nextPages);

    stopCamera();

    setScreen("M4");
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setCameraError(
        "Camera is not ready yet. Please wait a moment and try again."
      );
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError(
        "Unable to capture the image."
      );
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const dataUrl = canvas.toDataURL(
      "image/jpeg",
      0.9
    );

    savePage({
      dataUrl,
      previewUrl: dataUrl,
      imageUrl: dataUrl,
      mimeType: "image/jpeg",
      fileName: `document-page-${
        existingPages.length + 1
      }.jpg`,
      width: canvas.width,
      height: canvas.height,
      source: "mobile-camera",
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCameraError(
        "Please select an image file."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      savePage({
        dataUrl: result,
        previewUrl: result,
        imageUrl: result,
        mimeType: file.type,
        fileName: file.name,
        source: "mobile-upload",
      });
    };

    reader.onerror = () => {
      setCameraError(
        "The selected image could not be opened."
      );
    };

    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    stopCamera();
    setScreen("M2");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-black/30 text-white backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-200">
              Step 2 of 6
            </p>

            <h1 className="truncate text-lg font-bold">
              Capture document
            </h1>
          </div>

          {existingPages.length > 0 && (
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
              {existingPages.length}{" "}
              {existingPages.length === 1
                ? "page"
                : "pages"}
            </div>
          )}
        </div>
      </header>

      <main className="flex min-h-screen flex-col">
        <div className="relative flex min-h-[62vh] flex-1 items-center justify-center overflow-hidden bg-black pt-20">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full max-h-[72vh] w-full object-cover"
            />
          ) : (
            <div className="flex max-w-sm flex-col items-center px-6 text-center text-white">
              {isStarting ? (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                    <Camera
                      size={34}
                      className="animate-pulse"
                    />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    Starting camera...
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Please allow camera access when your
                    browser asks.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                    <AlertCircle size={34} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    Camera unavailable
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {cameraError ||
                      "You can still upload a photo from your device."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900"
                  >
                    <Upload size={18} />
                    Upload photo
                  </button>
                </>
              )}
            </div>
          )}

          {cameraActive && (
            <>
              <div className="pointer-events-none absolute inset-x-8 top-1/2 h-[55%] -translate-y-1/2 rounded-2xl border-2 border-white/70" />

              <div className="pointer-events-none absolute inset-x-12 top-1/2 -translate-y-1/2 text-center text-xs font-medium text-white/80">
                Keep the entire document inside the frame
              </div>
            </>
          )}

          {cameraError && cameraActive && (
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-red-950/90 p-3 text-sm text-white">
              {cameraError}
            </div>
          )}
        </div>

        <section className="rounded-t-3xl bg-slate-950 px-5 pb-8 pt-5 text-white">
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-sm text-white/70">
              {existingPages.length
                ? "Capture another page or review the pages already captured."
                : "Position the document clearly inside the frame."}
            </p>

            <div className="mt-6 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10"
                aria-label="Upload image"
              >
                <ImageIcon size={22} />
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraActive}
                className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 bg-white text-slate-900 shadow-xl disabled:opacity-40"
                aria-label="Take photo"
              >
                <Camera size={30} />
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  window.setTimeout(() => {
                    window.location.reload();
                  }, 50);
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10"
                aria-label="Restart camera"
              >
                <RotateCcw size={21} />
              </button>
            </div>

            {existingPages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setScreen("M4");
                }}
                className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 font-semibold"
              >
                Review {existingPages.length}{" "}
                {existingPages.length === 1
                  ? "page"
                  : "pages"}
              </button>
            )}

            <p className="mt-5 text-center text-xs leading-5 text-white/50">
              For best results, use good lighting and avoid
              glare or shadows.
            </p>
          </div>
        </section>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}