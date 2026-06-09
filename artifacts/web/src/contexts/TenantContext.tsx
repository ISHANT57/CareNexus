import React, { createContext, useContext, useState, useEffect } from "react";
import { setTenantIdGetter } from "@/lib/api";

interface TenantContextValue {
  activeTenantId: string | "ALL";
  setActiveTenantId: (id: string | "ALL") => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  // Try to load the saved tenant preference or default to "ALL"
  const [activeTenantId, setActiveTenantIdState] = useState<string | "ALL">(
    localStorage.getItem("activeTenantId") || "ALL"
  );

  const setActiveTenantId = (id: string | "ALL") => {
    setActiveTenantIdState(id);
    localStorage.setItem("activeTenantId", id);
  };

  useEffect(() => {
    // Whenever the activeTenantId changes, update the API client getter
    setTenantIdGetter(() => activeTenantId);
  }, [activeTenantId]);

  return (
    <TenantContext.Provider value={{ activeTenantId, setActiveTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenantContext must be used within a TenantProvider");
  }
  return context;
}
