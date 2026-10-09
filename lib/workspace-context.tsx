"use client";

import * as React from "react";
import { getWorkspaces, type WorkspaceMembership } from "@/lib/account";
import { useAuth } from "@/lib/auth-context";

interface WorkspaceContextValue {
  memberships: WorkspaceMembership[];
  loading: boolean;
  /** null = personal workspace */
  activeWorkspaceId: string | null;
  activeMembership: WorkspaceMembership | undefined;
  setActiveWorkspaceId: (id: string | null) => void;
  refresh: () => Promise<void>;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "instanta.activeWorkspaceId";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [memberships, setMemberships] = React.useState<WorkspaceMembership[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = React.useState<string | null>(
    null,
  );

  const refresh = React.useCallback(async () => {
    try {
      const list = await getWorkspaces();
      setMemberships(list);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  React.useEffect(() => {
    // Reading the last-active workspace out of localStorage on mount is a
    // genuine sync-with-external-system effect.
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveWorkspaceIdState(saved);
    }
  }, []);

  const setActiveWorkspaceId = React.useCallback((id: string | null) => {
    setActiveWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const activeMembership = React.useMemo(
    () =>
      activeWorkspaceId
        ? memberships.find((m) => m.workspace.id === activeWorkspaceId)
        : memberships.find((m) => m.workspace.type === "PERSONAL"),
    [memberships, activeWorkspaceId],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        memberships,
        loading,
        activeWorkspaceId,
        activeMembership,
        setActiveWorkspaceId,
        refresh,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}
