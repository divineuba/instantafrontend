"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Tag } from "@/components/ui/tag";
import { ApiError } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace-context";
import { getTeam, inviteMember, updateMember, type TeamMember } from "@/lib/account";
import { useFieldErrors } from "@/lib/use-field-errors";

type InviteField = "email";

export default function TeamPage() {
  const { activeMembership } = useWorkspace();
  const workspaceId = activeMembership?.workspace.id;
  const [team, setTeam] = React.useState<TeamMember[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showInvite, setShowInvite] = React.useState(false);
  const [invite, setInvite] = React.useState({ email: "", costCentre: "" });
  const [inviting, setInviting] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const { errors, setFieldError, validateAll } = useFieldErrors<InviteField>();

  const inviteValidators: Record<InviteField, () => string | undefined> = {
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email.trim()) ? undefined : "Enter a valid email address"),
  };

  const load = React.useCallback(() => {
    if (!workspaceId) return;
    setLoading(true);
    getTeam(workspaceId)
      .then(setTeam)
      .catch(() => setError("Couldn't load team."))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  React.useEffect(() => {
    // Re-querying the server whenever the active workspace changes and
    // flagging it as in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId) return;
    if (!validateAll(inviteValidators)) return;
    setInviting(true);
    setInviteError(null);
    try {
      await inviteMember(workspaceId, invite);
      setInvite({ email: "", costCentre: "" });
      setShowInvite(false);
      load();
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : "Couldn't invite member.");
    } finally {
      setInviting(false);
    }
  }

  async function toggleCanBook(m: TeamMember) {
    if (!workspaceId) return;
    await updateMember(workspaceId, m.id, { canBook: !m.canBook });
    load();
  }

  async function changeRole(m: TeamMember, role: "ADMIN" | "MEMBER") {
    if (!workspaceId) return;
    await updateMember(workspaceId, m.id, { role });
    load();
  }

  if (!workspaceId) return <div className="text-sm text-neutral-600">No business workspace selected.</div>;
  if (loading) return <div className="text-sm text-neutral-600">Loading team…</div>;
  if (error || !team) return <div className="text-sm text-error">{error ?? "Something went wrong."}</div>;

  return (
    <div className="flex flex-col gap-5 max-w-[880px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-neutral-600 mt-1">Members, roles, and booking permissions.</p>
        </div>
        <Button onClick={() => setShowInvite((v) => !v)}>
          <Icon name="plus" size={14} /> Invite member
        </Button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="flex flex-col gap-3 bg-card border border-divider rounded-lg p-4">
          {inviteError && <div className="text-sm text-error">{inviteError}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email" required error={errors.email}>
              <Input
                type="email"
                value={invite.email}
                onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                onBlur={() => setFieldError("email", inviteValidators.email())}
                invalid={!!errors.email}
              />
            </Field>
            <Field label="Cost centre" optional>
              <Input
                value={invite.costCentre}
                onChange={(e) => setInvite({ ...invite, costCentre: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviting}>
              {inviting ? "Inviting…" : "Send invite"}
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-1">
        {team.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
            <span className="size-9 grid place-items-center bg-accent-100 text-accent-800 rounded-[10px] font-semibold text-xs shrink-0">
              {m.user.firstName[0]}
              {m.user.lastName[0]}
            </span>
            <span className="flex-1 min-w-[160px]">
              <span className="block text-sm font-medium truncate">
                {m.user.firstName} {m.user.lastName}
              </span>
              <span className="block text-xs text-neutral-600 truncate">
                {m.user.email} {m.costCentre ? `· ${m.costCentre}` : ""}
              </span>
            </span>
            <span className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-neutral-600 w-24 sm:w-28 text-right shrink-0">
                ${(m.spentCents / 100).toFixed(2)}
                {m.monthlyLimitCents ? ` / $${(m.monthlyLimitCents / 100).toFixed(2)}` : ""}
              </span>
              {m.role === "OWNER" ? (
                <Tag variant="accent">Owner</Tag>
              ) : (
                <Select
                  value={m.role}
                  onChange={(e) => changeRole(m, e.target.value as "ADMIN" | "MEMBER")}
                  className="w-24 sm:w-28 min-h-[32px] text-xs"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                </Select>
              )}
              {m.role !== "OWNER" && (
                <Button variant="secondary" onClick={() => toggleCanBook(m)}>
                  {m.canBook ? "Can book" : "Can't book"}
                </Button>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
