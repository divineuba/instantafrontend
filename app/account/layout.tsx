import { Suspense } from "react";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { AccountShell } from "@/components/account/account-shell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-sm text-neutral-600">
          Loading your account…
        </div>
      }
    >
      <WorkspaceProvider>
        <AccountShell>{children}</AccountShell>
      </WorkspaceProvider>
    </Suspense>
  );
}
