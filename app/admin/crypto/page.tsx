"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  getAdminCrypto,
  getAdminCryptoFeeRules,
  updateAdminCryptoFeeRule,
  getAdminCryptoAssets,
  toggleAdminCryptoAsset,
  getAdminCryptoOpenOrders,
  forceCancelAdminCryptoOrder,
  type AdminCrypto,
  type AdminCryptoFeeRule,
  type AdminCryptoAsset,
  type AdminCryptoOpenOrder,
  type CryptoTxnType,
} from "@/lib/admin";

const TXN_TYPE_LABEL: Record<CryptoTxnType, string> = {
  BUY: "Buy",
  SELL: "Sell",
  SWAP: "Swap",
  SEND: "Send",
  RECEIVE: "Receive",
  WITHDRAW: "Withdraw",
};

function usdCents(n: number) {
  return `$${(n / 100).toFixed(2)}`;
}

function FeeRulesCard() {
  const toast = useToast();
  const [rules, setRules] = React.useState<AdminCryptoFeeRule[] | null>(null);
  const [editingType, setEditingType] = React.useState<CryptoTxnType | null>(null);
  const [editBps, setEditBps] = React.useState("");
  const [editMinCents, setEditMinCents] = React.useState("");
  const [busyType, setBusyType] = React.useState<CryptoTxnType | null>(null);

  const load = React.useCallback(() => {
    getAdminCryptoFeeRules().then(setRules).catch(() => setRules([]));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function startEdit(rule: AdminCryptoFeeRule) {
    setEditingType(rule.txnType);
    setEditBps(String(rule.feeBps));
    setEditMinCents(String(rule.minFeeUsdCents));
  }

  async function saveEdit(txnType: CryptoTxnType) {
    const feeBps = Number(editBps);
    const minFeeUsdCents = Number(editMinCents);
    if (!Number.isInteger(feeBps) || feeBps < 0 || !Number.isInteger(minFeeUsdCents) || minFeeUsdCents < 0) return;
    setBusyType(txnType);
    try {
      await updateAdminCryptoFeeRule(txnType, { feeBps, minFeeUsdCents });
      setEditingType(null);
      load();
      toast("Fee rule updated.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't update that fee rule.", "error");
    } finally {
      setBusyType(null);
    }
  }

  return (
    <Card className="gap-3">
      <CardKicker>Fee rules</CardKicker>
      {!rules ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Transaction type</Th>
              <Th>Fee (bps)</Th>
              <Th>Min fee</Th>
              <Th>&nbsp;</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rules.map((rule) => (
              <Tr key={rule.txnType}>
                <Td>{TXN_TYPE_LABEL[rule.txnType]}</Td>
                <Td>
                  {editingType === rule.txnType ? (
                    <Input type="number" min="0" step="1" value={editBps} onChange={(e) => setEditBps(e.target.value)} className="max-w-[100px]" />
                  ) : (
                    `${rule.feeBps} bps (${(rule.feeBps / 100).toFixed(2)}%)`
                  )}
                </Td>
                <Td>
                  {editingType === rule.txnType ? (
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={editMinCents}
                      onChange={(e) => setEditMinCents(e.target.value)}
                      className="max-w-[100px]"
                    />
                  ) : (
                    usdCents(rule.minFeeUsdCents)
                  )}
                </Td>
                <Td>
                  <div className="flex items-center gap-2 justify-end">
                    {editingType === rule.txnType ? (
                      <>
                        <Button variant="secondary" disabled={busyType === rule.txnType} onClick={() => setEditingType(null)}>
                          Cancel
                        </Button>
                        <Button variant="primary" disabled={busyType === rule.txnType} onClick={() => saveEdit(rule.txnType)}>
                          {busyType === rule.txnType ? "Saving…" : "Save"}
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" onClick={() => startEdit(rule)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Card>
  );
}

function AssetsCard() {
  const toast = useToast();
  const [assets, setAssets] = React.useState<AdminCryptoAsset[] | null>(null);
  const [busySymbol, setBusySymbol] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    getAdminCryptoAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(asset: AdminCryptoAsset) {
    const verb = asset.isActive ? "pause" : "activate";
    if (!window.confirm(`${verb === "pause" ? "Pause" : "Activate"} trading for ${asset.symbol}?`)) return;
    setBusySymbol(asset.symbol);
    try {
      await toggleAdminCryptoAsset(asset.symbol);
      load();
      toast(`${asset.symbol} ${asset.isActive ? "paused" : "activated"}.`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : `Couldn't ${verb} that asset.`, "error");
    } finally {
      setBusySymbol(null);
    }
  }

  return (
    <Card className="gap-3">
      <CardKicker>Assets</CardKicker>
      {!assets ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Asset</Th>
              <Th>Status</Th>
              <Th>&nbsp;</Th>
            </Tr>
          </Thead>
          <Tbody>
            {assets.map((asset) => (
              <Tr key={asset.symbol}>
                <Td>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Icon name="bitcoin" size={13} /> {asset.symbol}
                    <span className="text-neutral-600 font-normal">{asset.name}</span>
                  </span>
                </Td>
                <Td>
                  <Tag variant={asset.isActive ? "success" : "neutral"}>{asset.isActive ? "Active" : "Paused"}</Tag>
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <Button variant="ghost" disabled={busySymbol === asset.symbol} onClick={() => handleToggle(asset)}>
                      {busySymbol === asset.symbol ? "Working…" : asset.isActive ? "Pause" : "Activate"}
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Card>
  );
}

function OpenOrdersCard() {
  const toast = useToast();
  const [orders, setOrders] = React.useState<AdminCryptoOpenOrder[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    getAdminCryptoOpenOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCancel(order: AdminCryptoOpenOrder) {
    if (!window.confirm(`Force-cancel this ${order.type === "LIMIT_BUY" ? "limit buy" : "limit sell"} order for ${order.user.email}?`)) return;
    setBusyId(order.id);
    try {
      await forceCancelAdminCryptoOrder(order.id);
      load();
      toast("Order cancelled and funds refunded.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't cancel that order.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <CardKicker>Open orders</CardKicker>
      {!orders ? (
        <Table className="mt-2.5">
          <Tbody>
            <SkeletonTableRows rows={4} columns={6} />
          </Tbody>
        </Table>
      ) : orders.length === 0 ? (
        <EmptyState icon="card" title="No open orders" />
      ) : (
        <Table className="mt-2.5">
          <Thead>
            <Tr>
              <Th>Customer</Th>
              <Th>Asset</Th>
              <Th>Side</Th>
              <Th>Limit price</Th>
              <Th>Amount</Th>
              <Th>&nbsp;</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  {order.user.firstName} {order.user.lastName}
                  <span className="block text-xs text-neutral-600">{order.user.email}</span>
                </Td>
                <Td>{order.assetSymbol}</Td>
                <Td>{order.type === "LIMIT_BUY" ? "Buy" : "Sell"}</Td>
                <Td>{usdCents(order.limitPriceUsdCents)}</Td>
                <Td>
                  {order.type === "LIMIT_BUY" ? usdCents(order.nairaAmountCents ?? 0) : `${order.amount} ${order.assetSymbol}`}
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <Button variant="ghost" disabled={busyId === order.id} onClick={() => handleCancel(order)}>
                      {busyId === order.id ? "Cancelling…" : "Force cancel"}
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}

export default function AdminCryptoPage() {
  const [data, setData] = React.useState<AdminCrypto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getAdminCrypto()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load crypto. Try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader title="Crypto" subtitle="Trade volume, asset breakdown and crypto transactions." />

      {loading && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      )}
      {error && <EmptyState icon="alert" title="Couldn't load crypto" description={error} />}

      {data && !loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.cryptoKpis.map((k) => (
              <Card key={k.l}>
                <CardKicker>{k.l}</CardKicker>
                <CardTitle>{k.v}</CardTitle>
                <CardBody className="!text-xs">{k.d}</CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="gap-3">
              <CardKicker>Volume by asset</CardKicker>
              {data.assetBreakdown.length === 0 && (
                <p className="text-sm text-neutral-600 m-0">No trades in the last 30 days.</p>
              )}
              {data.assetBreakdown.map((r) => (
                <div key={r.n} className="flex items-center gap-3">
                  <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md shrink-0">
                    <Icon name={r.icon as IconName} size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{r.n}</span>
                      <span className="text-neutral-600">{r.w}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: r.w, background: r.c }} />
                    </div>
                  </div>
                  <span className="font-medium text-sm">{r.v}</span>
                </div>
              ))}
            </Card>

            <Card className="gap-3">
              <CardKicker>Transaction types</CardKicker>
              {data.txTypeBreakdown.map((s) => (
                <div key={s.n} className="flex items-center justify-between gap-3 py-1.5 border-b border-divider last:border-0">
                  <div>
                    <div className="text-sm font-medium">{s.n}</div>
                    <div className="text-xs text-neutral-600">{s.d}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.a}</span>
                    <Tag style={{ background: s.sbg, color: s.sfg }}>{s.s}</Tag>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeeRulesCard />
            <AssetsCard />
          </div>

          <OpenOrdersCard />

          <div>
            <CardKicker>Recent transactions</CardKicker>
            <Table className="mt-2.5">
              <Thead>
                <Tr>
                  <Th>Transaction</Th>
                  <Th>Date</Th>
                  <Th>Customer</Th>
                  <Th>Asset</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.cryptoTx.map((tx) => (
                  <Tr key={tx.id}>
                    <Td className="font-medium">{tx.id}</Td>
                    <Td>{tx.d}</Td>
                    <Td>{tx.c}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name={tx.icon as IconName} size={13} /> {tx.b}
                      </span>
                    </Td>
                    <Td>{tx.m}</Td>
                    <Td>{tx.a}</Td>
                    <Td>
                      <Tag style={{ background: tx.sbg, color: tx.sfg }}>{tx.s}</Tag>
                    </Td>
                  </Tr>
                ))}
                {data.cryptoTx.length === 0 && (
                  <Tr>
                    <Td colSpan={7} className="p-0">
                      <EmptyState icon="card" title="No transactions in the last 30 days" />
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
