"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AppSettingsContextValue = {
  showBreakdown: boolean;
  setShowBreakdown: (showBreakdown: boolean) => void;
};

const STORAGE_KEY = "canvasjob:show-breakdown";
const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [showBreakdown, setShowBreakdownState] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setShowBreakdownState(stored === "true");
    }
  }, []);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      showBreakdown,
      setShowBreakdown(next) {
        setShowBreakdownState(next);
        window.localStorage.setItem(STORAGE_KEY, String(next));
      },
    }),
    [showBreakdown],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
}
