"use client";

import * as React from "react";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  getAdminUsers,
  assignAdmin,
  revokeAdmin,
  type AdminUsersResponse,
  type AdminRole,
} from "@/lib/admin";

const ADMIN_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "OPS_MANAGER",
  "LOGISTICS_MANAGER",
  "TRAVEL_MANAGER",
  "FINANCE_MANAGER",
  "CONTENT_MANAGER",
  "SUPPORT_MANAGER",
];

export default function AdminUsersPage() {
  const [data, setData] = React.useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [assignEmail, setAssignEmail] = React.useState("");
  const [assignRole, setAssignRole] = React.useState<AdminRole>("SUPPORT_MANAGER");
  const [assigning, setAssigning] = React.useState(false);
  const [assignError, setAssignError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminUsers()
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load admin users. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignEmail.trim()) return;
    setAssigning(true);
    setAssignError(null);
    try {
      await assignAdmin({ email: assignEmail.trim(), role: assignRole });
      setAssignEmail("");
      load();
    } catch (err) {
      setAssignError(
        err instanceof ApiError ? err.message : "Couldn't assign that role. Try again.",
      );
    } finally {
      setAssigning(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!window.confirm("Revoke admin access for this user?")) return;
    setBusyId(id);
    try {
      await revokeAdmin(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <div>
        <h1 className="text-2xl font-bold">Users &amp; permissions</h1>
        <p className="text-sm text-neutral-600 mt-1">Admin accounts and what each role can access.</p>
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {data && !loading && !error && (
        <>
          <form
            onSubmit={handleAssign}
            className="flex flex-wrap items-end gap-3 bg-card border border-divider rounded-lg p-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700" htmlFor="assign-email">
                Email
              </label>
              <input
                id="assign-email"
                type="email"
                required
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                placeholder="name@company.com"
                className="min-w-[220px] px-3 py-2 text-sm bg-white border border-neutral-300 rounded-md outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700" htmlFor="assign-role">
                Role
              </label>
              <select
                id="assign-role"
                value={assignRole}
                onChange={(e) => setAssignRole(e.target.value as AdminRole)}
                className="px-3 py-2 text-sm bg-white border border-neutral-300 rounded-md outline-none focus:border-accent"
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary" disabled={assigning}>
              {assigning ? "Assigning…" : "Assign admin"}
            </Button>
            {assignError && <span className="text-sm text-error">{assignError}</span>}
          </form>

          <Table>
            <Thead>
              <Tr>
                <Th>Admin</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Since</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {data.admins.map((a) => (
                <Tr key={a.id}>
                  <Td className="font-medium">{a.name}</Td>
                  <Td>{a.email}</Td>
                  <Td>{a.roleLabel}</Td>
                  <Td>{a.since}</Td>
                  <Td>
                    <Button
                      variant="secondary"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={busyId === a.id}
                      onClick={() => handleRevoke(a.id)}
                    >
                      Revoke
                    </Button>
                  </Td>
                </Tr>
              ))}
              {data.admins.length === 0 && (
                <Tr>
                  <Td colSpan={5} className="text-center text-neutral-600 py-8">
                    No admins assigned yet.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>

          <div>
            <h2 className="text-lg font-semibold mb-2.5">Permission matrix</h2>
            <Table>
              <Thead>
                <Tr>
                  <Th>Role</Th>
                  <Th>Admins</Th>
                  {data.permCols.map((c) => (
                    <Th key={c}>{c}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {data.roles.map((role) => (
                  <Tr key={role.n}>
                    <Td className="font-medium">
                      {role.n}
                      <span className="block text-xs text-neutral-600 font-normal">{role.d}</span>
                    </Td>
                    <Td>{role.u}</Td>
                    {role.cells.map((cell, i) => (
                      <Td key={i}>
                        <span
                          className="inline-flex items-center justify-center min-w-[44px] text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: cell.bg, color: cell.fg }}
                        >
                          {cell.l}
                        </span>
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
