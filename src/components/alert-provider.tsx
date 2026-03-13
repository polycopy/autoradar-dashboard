"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Toast, type AlertToast } from "./alert-toast";
import { playAlertSound } from "@/lib/alert-sound";
import type { ScoredListing } from "./opportunities-view";

type AlertContextType = {
  addAlert: (listing: ScoredListing) => void;
  alertsEnabled: boolean;
  setAlertsEnabled: (enabled: boolean) => void;
};

const AlertContext = createContext<AlertContextType>({
  addAlert: () => {},
  alertsEnabled: true,
  setAlertsEnabled: () => {},
});

export function useAlerts() {
  return useContext(AlertContext);
}

const MAX_VISIBLE = 3;

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<AlertToast[]>([]);
  const [alertsEnabled, setAlertsEnabledState] = useState(true);
  const initialized = useRef(false);

  // Load preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("autoradar-alerts-enabled");
      if (stored !== null) {
        setAlertsEnabledState(stored === "true");
      }
    } catch {}
    initialized.current = true;
  }, []);

  const setAlertsEnabled = useCallback((enabled: boolean) => {
    setAlertsEnabledState(enabled);
    try {
      localStorage.setItem("autoradar-alerts-enabled", String(enabled));
    } catch {}
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addAlert = useCallback(
    (listing: ScoredListing) => {
      if (!alertsEnabled) return;

      const title =
        [listing.make_normalized, listing.model_normalized, listing.vehicle_year]
          .filter(Boolean)
          .join(" ") || listing.title || "Nuevo listado";

      const toast: AlertToast = {
        id: `${listing.fb_listing_id}-${Date.now()}`,
        listingId: listing.fb_listing_id,
        title,
        price: Number(listing.price_amount) || 0,
        grade: listing.grade,
        discount: Math.round(listing.discount_pct),
      };

      setToasts((prev) => {
        const next = [toast, ...prev];
        // Keep max visible, auto-remove oldest
        if (next.length > MAX_VISIBLE) {
          return next.slice(0, MAX_VISIBLE);
        }
        return next;
      });

      playAlertSound();
    },
    [alertsEnabled],
  );

  return (
    <AlertContext.Provider value={{ addAlert, alertsEnabled, setAlertsEnabled }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast, i) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast alert={toast} index={i} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}
