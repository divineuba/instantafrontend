"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/lib/toast-context";
import {
  getAdminPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  type AdminPricingRule,
  type PricingRuleType,
} from "@/lib/admin";

const TYPE_LABELS: Record<PricingRuleType, string> = {
  SPEED: "Delivery speed",
  WEIGHT_BAND: "Weight band",
  DISTANCE_RATE: "Distance rate",
  INSURANCE: "Insurance",
};

const TYPE_ORDER: PricingRuleType[] = ["SPEED", "WEIGHT_BAND", "DISTANCE_RATE", "INSURANCE"];

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function AdminPricingPage() {
  const [data, setData] = React.useState<AdminPricingRule[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editLabel, setEditLabel] = React.useState("");
  const [editAmount, setEditAmount] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newType, setNewType] = React.useState<PricingRuleType>("SPEED");
  const [newCode, setNewCode] = React.useState("");
  const [newLabel, setNewLabel] = React.useState("");
  const [newAmount, setNewAmount] = React.useState("");
  const [createError, setCreateError] = React.useState<string | undefined>(undefined);
  const toast = useToast();

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminPricingRules()
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load pricing rules. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function startEdit(rule: AdminPricingRule) {
    setEditingId(rule.id);
    setEditLabel(rule.label);
    setEditAmount(String(rule.amount));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    const amount = Number(editAmount);
    if (!editLabel.trim() || Number.isNaN(amount) || amount < 0) return;
    setBusyId(id);
    try {
      await updatePricingRule(id, { label: editLabel.trim(), amount });
      setEditingId(null);
      load();
      toast("Pricing rule updated.", "success");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(rule: AdminPricingRule) {
    if (!window.confirm(`Delete the "${rule.label}" pricing rule?`)) return;
    setBusyId(rule.id);
    try {
      await deletePricingRule(rule.id);
      load();
      toast("Pricing rule deleted.", "success");
    } finally {
      setBusyId(null);
    }
  }

  function openCreate() {
    setNewType("SPEED");
    setNewCode("");
    setNewLabel("");
    setNewAmount("");
    setCreateError(undefined);
    setCreateOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(newAmount);
    if (!newCode.trim() || !newLabel.trim() || Number.isNaN(amount) || amount < 0) {
      setCreateError("Fill in a code, label and a valid non-negative amount");
      return;
    }
    setCreating(true);
    try {
      await createPricingRule({ type: newType, code: newCode.trim().toUpperCase().replace(/\s+/g, "_"), label: newLabel.trim(), amount });
      setCreateOpen(false);
      load();
      toast("Pricing rule created.", "success");
    } catch {
      setCreateError("A rule with that type and code already exists");
    } finally {
      setCreating(false);
    }
  }

  const grouped = React.useMemo(() => {
    if (!data) return [];
    return TYPE_ORDER.map((type) => ({ type, rules: data.filter((r) => r.type === type) })).filter(
      (g) => g.rules.length > 0,
    );
  }, [data]);

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader
        title="Pricing"
        subtitle="Rates and surcharges used to calculate every delivery quote."
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Icon name="plus" size={14} /> New rule
          </Button>
        }
      />

      {loading && (
        <Table>
          <Tbody>
            <SkeletonTableRows rows={6} columns={4} />
          </Tbody>
        </Table>
      )}
      {error && <EmptyState icon="alert" title="Couldn't load pricing rules" description={error} />}

      {data && !loading && !error && data.length === 0 && (
        <EmptyState icon="tag" title="No pricing rules yet" />
      )}

      {data && !loading && !error && data.length > 0 && (
        <div className="flex flex-col gap-7">
          {grouped.map((group) => (
            <div key={group.type} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-neutral-800">{TYPE_LABELS[group.type]}</h2>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Code</Th>
                    <Th>Label</Th>
                    <Th>Amount</Th>
                    <Th>&nbsp;</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {group.rules.map((rule) => (
                    <Tr key={rule.id}>
                      <Td className="font-mono text-xs text-neutral-600">{rule.code}</Td>
                      <Td>
                        {editingId === rule.id ? (
                          <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="max-w-[220px]" />
                        ) : (
                          rule.label
                        )}
                      </Td>
                      <Td>
                        {editingId === rule.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="max-w-[120px]"
                          />
                        ) : (
                          money(rule.amount)
                        )}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2 justify-end">
                          {editingId === rule.id ? (
                            <>
                              <Button variant="secondary" size="default" disabled={busyId === rule.id} onClick={cancelEdit}>
                                Cancel
                              </Button>
                              <Button variant="primary" size="default" disabled={busyId === rule.id} onClick={() => saveEdit(rule.id)}>
                                {busyId === rule.id ? "Saving…" : "Save"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="default" disabled={busyId === rule.id} onClick={() => startEdit(rule)}>
                                Edit
                              </Button>
                              <Button variant="ghost" size="default" disabled={busyId === rule.id} onClick={() => handleDelete(rule)}>
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <ModalHeader title="New pricing rule" onClose={() => setCreateOpen(false)} />
        <form onSubmit={handleCreate}>
          <ModalBody className="flex flex-col gap-4">
            <Field label="Type" required>
              <Select value={newType} onChange={(e) => setNewType(e.target.value as PricingRuleType)}>
                {TYPE_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Code" required hint="Short, unique identifier within this type, e.g. EXPRESS or PER_KM">
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="EXPRESS" />
            </Field>
            <Field label="Label" required>
              <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Express delivery" />
            </Field>
            <Field label="Amount ($)" required error={createError}>
              <Input type="number" step="0.01" min="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="9.00" />
            </Field>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
