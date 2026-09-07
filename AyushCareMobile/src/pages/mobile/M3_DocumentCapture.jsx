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
    retargetPageForRetake,
    setRetargetPageForRetake,
    setCapturedDocument,
    setCapturedDocuments,
    setScreen,
  } = useMobileStore();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const mountedRef = useRef(true);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const type = normalizeDocumentType(
    selectedDocumentType ||
      documentType ||
      capturedDocument?.documentType
  );

  const rawPages =
    Array.isArray(capturedDocuments) && capturedDocuments.length > 0
      ? capturedDocuments
      : Array.isArray(capturedDocument?.pages) &&
          capturedDocument.pages.length > 0
        ? capturedDocument.pages
        : capturedDocument &&
            (capturedDocument.previewUrl ||
              capturedDocument.dataUrl ||
              capturedDocument.imageUrl ||
              capturedDocument.image)
          ? [capturedDocument]
          : [];

  const existingPages = rawPages.filter(
    (p) =>
      p &&
      (p.previewUrl ||
        p.dataUrl ||
        p.imageUrl ||
        p.image ||
        p.preview)
  );

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setCameraActive(false);
  };

  const startCamera = async () => {
    setIsStarting(true);
    setCameraError("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera access is not supported in this browser. (Requires HTTPS or localhost)."
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);

        try {
          await videoRef.current.play();
        } catch {
          // Some mobile browsers delay playback until interaction.
        }
      }
    } catch (error) {
      console.error("Camera initialization failed:", error);

      if (mountedRef.current) {
        setCameraError(
          error?.name === "NotAllowedError" ||
            error?.name === "PermissionDeniedError"
            ? "Camera permission was denied. Please enable camera access in your browser settings or upload a photo."
            : error?.message || "Camera access could not be started."
        );
        setCameraActive(false);
      }
    } finally {
      if (mountedRef.current) {
        setIsStarting(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    startCamera();

    return () => {
      mountedRef.current = false;
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

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

  const savePages = (sources) => {
    const safeSources = Array.isArray(sources) ? sources : [sources];
    if (!safeSources.length) return;

    let nextPages;
    if (
      safeSources.length === 1 &&
      typeof retargetPageForRetake === "number" &&
      retargetPageForRetake >= 0 &&
      retargetPageForRetake < existingPages.length
    ) {
      const singleSource = safeSources[0] || {};
      const preview =
        typeof singleSource.dataUrl === "string"
          ? singleSource.dataUrl
          : typeof singleSource.previewUrl === "string"
            ? singleSource.previewUrl
            : typeof singleSource.imageUrl === "string"
              ? singleSource.imageUrl
              : "";

      const normalizedSource = {
        ...singleSource,
        dataUrl: preview,
        previewUrl: preview,
        imageUrl: preview,
      };

      const replacementPage = createDocumentPage({
        source: normalizedSource,
        documentType: type,
        pageNumber: retargetPageForRetake + 1,
      });

      nextPages = existingPages.map((p, idx) =>
        idx === retargetPageForRetake ? replacementPage : p
      );

      if (typeof setRetargetPageForRetake === "function") {
        setRetargetPageForRetake(null);
      }
    } else {
      const newCreatedPages = safeSources.map((source, idx) => {
        const safeSource = source || {};
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

        return createDocumentPage({
          source: normalizedSource,
          documentType: type,
          pageNumber: existingPages.length + idx + 1,
        });
      });

      nextPages = [...existingPages, ...newCreatedPages];
    }

    persistPages(nextPages);
    stopCamera();
    setScreen("M4");
  };

  const savePage = (source) => savePages([source]);

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

  const handleFileChange = async (event) => {
    const fileList = event.target.files;
    if (!fileList || !fileList.length) return;

    const files = Array.from(fileList);
    event.target.value = "";

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      return isImage;
    });

    if (!validFiles.length) {
      setCameraError(
        "Please select a valid image (JPEG, PNG, or WebP)."
      );
      return;
    }

    try {
      const readPromises = validFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result;
              resolve({
                file,
                dataUrl: result,
                previewUrl: result,
                imageUrl: result,
                mimeType: file.type || "image/jpeg",
                fileName: file.name,
                fileSize: file.size
                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                  : "1.0 MB",
                source: "mobile-upload",
              });
            };
            reader.onerror = () =>
              reject(new Error(`Failed to read file ${file.name}`));
            reader.readAsDataURL(file);
          })
      );

      const parsedPages = await Promise.all(readPromises);
      savePages(parsedPages);
    } catch (err) {
      console.error("File upload error:", err);
      setCameraError("One or more selected files could not be opened.");
    }
  };

  const handleBack = () => {
    stopCamera();
    setScreen("M2");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-slate-200 bg-white/95 text-slate-900 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Step 2 of 6
            </p>

            <h1 className="truncate text-lg font-bold">
              Capture document
            </h1>
          </div>

          {existingPages.length > 0 && (
            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold">
              {existingPages.length}{" "}
              {existingPages.length === 1
                ? "page"
                : "pages"}
            </div>
          )}
        </div>
      </header>

      <main className="flex min-h-screen flex-col">
        <div className="relative flex min-h-[62vh] flex-1 items-center justify-center overflow-hidden bg-slate-100 pt-20">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full max-h-[72vh] w-full object-cover ${cameraActive ? "block" : "hidden"}`}
          />

          {!cameraActive && (
            <div className="flex max-w-sm flex-col items-center px-6 text-center text-slate-900">
              {isStarting ? (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <Camera
                      size={34}
                      className="animate-pulse"
                    />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    Starting camera...
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Please allow camera access when your
                    browser asks.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <AlertCircle size={34} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    Camera unavailable
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {cameraError ||
                      "You can select multiple photos or PDF documents from your device."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900"
                  >
                    <Upload size={18} />
                    Upload photos or PDF
                  </button>
                </>
              )}
            </div>
          )}

          {cameraActive && (
            <>
              <div className="pointer-events-none absolute inset-x-8 top-1/2 h-[55%] -translate-y-1/2 rounded-2xl border-2 border-teal-500" />

              <div className="pointer-events-none absolute inset-x-12 top-1/2 -translate-y-1/2 text-center text-xs font-medium text-slate-600">
                Keep the entire document inside the frame
              </div>
            </>
          )}

          {cameraError && cameraActive && (
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-red-950/90 p-3 text-sm text-slate-900">
              {cameraError}
            </div>
          )}
        </div>

        <section className="rounded-t-3xl bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] px-5 pb-8 pt-5 text-slate-900">
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-sm text-slate-600">
              {existingPages.length
                ? `${existingPages.length} ${existingPages.length === 1 ? "page" : "pages"} captured. Capture more or upload multiple photos/PDFs.`
                : "Position the document inside the frame or upload photos/PDF."}
            </p>

            <div className="mt-6 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50"
                aria-label="Upload photos or PDF"
                title="Upload photos or PDF"
              >
                <ImageIcon size={22} />
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraActive}
                className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-teal-700 bg-white text-teal-800 shadow-xl disabled:opacity-40"
                aria-label="Take photo"
              >
                <Camera size={30} />
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  startCamera();
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50"
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
                className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold"
              >
                Review {existingPages.length}{" "}
                {existingPages.length === 1
                  ? "page"
                  : "pages"}
              </button>
            )}

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Supports JPEG, PNG, and WebP images. Multiple images can be selected at once.
            </p>
          </div>
        </section>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp" capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}