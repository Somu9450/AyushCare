import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Link2,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import useMobileStore, {
  SCREENS,
} from "../../store/useMobileStore";

import {
  DEFAULT_DEMO_TOKEN,
  connectMobileToKiosk,
  getMobileSessionStatus,
} from "../../services/mobileSessionService";

function KioskConnectScreen() {
  const {
    kioskSession,
    connectKioskSession: connectStoreKioskSession,
    setScreen,
    isAuthenticated,
  } = useMobileStore();

  const [reference, setReference] = useState(
    DEFAULT_DEMO_TOKEN
  );

  const [isConnecting, setIsConnecting] =
    useState(false);

  const [error, setError] = useState("");

  const existingStatus =
    getMobileSessionStatus(kioskSession);

  useEffect(() => {
    if (
      existingStatus.connected &&
      kioskSession?.sessionToken
    ) {
      setReference(kioskSession.sessionToken);
    }
  }, [
    existingStatus.connected,
    kioskSession?.sessionToken,
  ]);

  const handleConnect = async () => {
    setError("");

    const trimmedReference =
      reference.trim();

    if (!trimmedReference) {
      setError(
        "Please scan the kiosk QR code or enter a session reference."
      );
      return;
    }

    setIsConnecting(true);

    try {
      const result =
        await connectMobileToKiosk(
          trimmedReference
        );

      if (!result.success) {
        setError(
          result.message ||
            "Unable to connect to this kiosk."
        );
        return;
      }

      if (connectStoreKioskSession) {
        connectStoreKioskSession(
          result.session,
          {
            id:
              useMobileStore.getState()
                .patient?.id ||
              "PATIENT-001",
            patientId:
              useMobileStore.getState()
                .patient?.patientId ||
              "PATIENT-001",
            name:
              useMobileStore.getState()
                .patient?.name ||
              "Patient",
          }
        );
      }

      setScreen(SCREENS.M1);
    } catch (connectionError) {
      console.error(
        "Kiosk connection failed:",
        connectionError
      );

      setError(
        "Something went wrong while connecting. Please try again."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBack = () => {
    if (isAuthenticated) {
      setScreen(SCREENS.M1);
    } else {
      setScreen(SCREENS.AUTH);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 flex w-fit items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-slate-600 hover:bg-white"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <QrCode size={42} strokeWidth={1.8} />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Connect to Kiosk
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Scan the QR code shown on the
              AyushCare kiosk to securely connect
              this mobile session.
            </p>
          </div>

          {existingStatus.connected && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2
                className="mt-0.5 shrink-0 text-emerald-600"
                size={20}
              />

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Kiosk session already active
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  You can continue with the
                  connected session below.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="kiosk-reference"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Kiosk session reference
              </label>

              <input
                id="kiosk-reference"
                value={reference}
                onChange={(event) =>
                  setReference(event.target.value)
                }
                placeholder="Scan or enter reference"
                autoComplete="off"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Link2 size={18} />

              {isConnecting
                ? "Connecting..."
                : "Connect to Kiosk"}
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-blue-600">
                <ShieldCheck size={18} />
                <span className="text-xs font-semibold">
                  Session protected
                </span>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                The QR reference identifies a
                temporary kiosk session.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-blue-600">
                <Smartphone size={18} />
                <span className="text-xs font-semibold">
                  No second login
                </span>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                A connected kiosk can associate
                with your existing mobile session.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          For demonstration, the default session
          reference is pre-filled.
        </p>
      </div>
    </div>
  );
}

export default KioskConnectScreen;