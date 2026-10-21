import { apiFetch } from "@/lib/api";
import type { WorkspaceSummary } from "@/lib/auth";

// ---- Overview --------------------------------------------------------------

export interface AccountOverview {
  greetingName: string;
  walletCents: number;
  upcomingTrip: {
    bookingId: string;
    bookingRef: string;
    originCode: string;
    destinationCode: string;
    date: string;
    flightNo: string;
    depart: string;
  } | null;
  activeDelivery: {
    trackingId: string;
    from: string;
    to: string;
    status: string;
    riderName: string | null;
  } | null;
  recent: ActivityRow[];
  needsAttention: {
    icon: string;
    title: string;
    sub: string;
    href: string;
  }[];
  emailVerified: boolean;
  hasPaymentMethod: boolean;
  isNewAccount: boolean;
}

export interface ActivityRow {
  vertical: "Delivery" | "Flight" | "Payment" | "Crypto" | "Love";
  icon: string;
  ref: string;
  title: string;
  date: string;
  amount: string;
  status: string;
}

export function getOverview() {
  return apiFetch<AccountOverview>("/account/overview");
}

// ---- Activity ---------------------------------------------------------------

export interface ActivityResponse {
  counts: { all: number; deliveries: number; flights: number; payments: number; crypto: number };
  rows: ActivityRow[];
}

export function getActivity(tab: "all" | "deliveries" | "flights" | "payments" | "crypto" = "all") {
  return apiFetch<ActivityResponse>(`/account/activity?tab=${tab}`);
}

// ---- Trips --------------------------------------------------------------

export interface SavedPassenger {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  createdAt: string;
}

export interface SupportTicketSummary {
  id: string;
  reference: string;
  subject: string;
  category: string;
  status: "OPEN" | "AWAITING" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export interface TripsResponse {
  upcoming: {
    bookingId: string;
    bookingRef: string;
    originCode: string;
    destinationCode: string;
    outboundDate: string;
    outboundDepart: string;
    flightNo: string;
    aircraft: string;
    returnDate: string;
  } | null;
  past: { bookingId: string; route: string; date: string; amount: string }[];
  documents: { name: string; meta: string; bookingId: string }[];
  passengers: SavedPassenger[];
  supportRequests: SupportTicketSummary[];
}

export function getTrips() {
  return apiFetch<TripsResponse>("/account/trips");
}

export function addPassenger(input: {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
}) {
  return apiFetch<SavedPassenger>("/account/passengers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePassenger(
  id: string,
  input: Partial<{
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    nationality: string;
    passportNumber: string;
    passportCountry: string;
    passportExpiry: string;
  }>,
) {
  return apiFetch<SavedPassenger>(`/account/passengers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deletePassenger(id: string) {
  return apiFetch<{ ok: true }>(`/account/passengers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---- Payments -------------------------------------------------------------

export interface PaymentMethodCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface TransactionRow {
  date: string;
  desc: string;
  svc: string;
  icon: string;
  method: string;
  amount: string;
  status: string;
}

export interface PaymentsResponse {
  walletCents: number;
  methods: PaymentMethodCard[];
  transactions: TransactionRow[];
}

export function getPayments() {
  return apiFetch<PaymentsResponse>("/account/payments");
}

export function topUpWallet(amountCents: number) {
  return apiFetch<{ walletCents: number }>("/account/payments/wallet/topup", {
    method: "POST",
    body: JSON.stringify({ amountCents }),
  });
}

export function withdrawWallet(amountCents: number) {
  return apiFetch<{ walletCents: number }>("/account/payments/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify({ amountCents }),
  });
}

export function addCard(input: {
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
}) {
  return apiFetch<PaymentMethodCard>("/account/payments/methods", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteCard(id: string) {
  return apiFetch<{ ok: true }>(`/account/payments/methods/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function setDefaultCard(id: string) {
  return apiFetch<PaymentMethodCard>(`/account/payments/methods/${encodeURIComponent(id)}/default`, {
    method: "PATCH",
  });
}

// ---- Profile --------------------------------------------------------------

export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  defaultAddress: string | null;
  currency: string;
  createdAt: string;
  sessions: { id: string; createdAt: string; expiresAt: string }[];
}

export function getProfile() {
  return apiFetch<ProfileResponse>("/account/profile");
}

export function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: string;
  currency?: string;
}) {
  return apiFetch<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    defaultAddress: string | null;
    currency: string;
  }>("/account/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function revokeSession(id: string) {
  return apiFetch<{ ok: true }>(`/account/sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---- Notifications ----------------------------------------------------------

export interface NotificationItem {
  id: string;
  type: "DELIVERY" | "TRAVEL" | "PAYMENT" | "SYSTEM";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export function getNotifications(filter: string = "all") {
  return apiFetch<NotificationItem[]>(`/notifications?filter=${filter}`);
}

export function markAllNotificationsRead() {
  return apiFetch<{ ok: true }>("/notifications/read-all", { method: "POST" });
}

// ---- Support ----------------------------------------------------------------

export interface SupportTicketMessage {
  id: string;
  author: "USER" | "SUPPORT";
  body: string;
  createdAt: string;
}

export interface SupportTicketDetail extends SupportTicketSummary {
  messages: SupportTicketMessage[];
}

export function getSupportTickets() {
  return apiFetch<SupportTicketSummary[]>("/support/tickets");
}

export function getSupportTicket(id: string) {
  return apiFetch<SupportTicketDetail>(`/support/tickets/${encodeURIComponent(id)}`);
}

export function createSupportTicket(input: { subject: string; category: string; body: string }) {
  return apiFetch<SupportTicketDetail>("/support/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function addSupportMessage(id: string, body: string) {
  return apiFetch<SupportTicketDetail>(`/support/tickets/${encodeURIComponent(id)}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

// ---- Workspaces -------------------------------------------------------------

export interface WorkspaceMembership {
  role: "OWNER" | "ADMIN" | "MEMBER";
  costCentre: string | null;
  workspace: WorkspaceSummary & { createdAt: string };
}

export function getWorkspaces() {
  return apiFetch<WorkspaceMembership[]>("/workspaces");
}

export function createWorkspace(name: string) {
  return apiFetch<WorkspaceSummary>("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export interface TeamMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  costCentre: string | null;
  canBook: boolean;
  monthlyLimitCents: number | null;
  spentCents: number;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export function getTeam(workspaceId: string) {
  return apiFetch<TeamMember[]>(`/workspaces/${encodeURIComponent(workspaceId)}/team`);
}

export function inviteMember(workspaceId: string, input: { email: string; costCentre?: string }) {
  return apiFetch<TeamMember>(`/workspaces/${encodeURIComponent(workspaceId)}/team/invite`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateMember(
  workspaceId: string,
  memberId: string,
  input: { role?: "ADMIN" | "MEMBER"; costCentre?: string; canBook?: boolean; monthlyLimitCents?: number },
) {
  return apiFetch<TeamMember>(
    `/workspaces/${encodeURIComponent(workspaceId)}/team/${encodeURIComponent(memberId)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export interface ApprovalRequest {
  id: string;
  requestedByName: string;
  costCentre: string | null;
  type: "DELIVERY" | "BOOKING";
  title: string;
  amountCents: number;
  status: "PENDING" | "APPROVED" | "DECLINED";
  createdAt: string;
  decidedAt: string | null;
}

export function getApprovals(workspaceId: string) {
  return apiFetch<ApprovalRequest[]>(`/workspaces/${encodeURIComponent(workspaceId)}/approvals`);
}

export function createApproval(
  workspaceId: string,
  input: { type: "DELIVERY" | "BOOKING"; title: string; amountCents: number; costCentre?: string },
) {
  return apiFetch<ApprovalRequest>(`/workspaces/${encodeURIComponent(workspaceId)}/approvals`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function decideApproval(workspaceId: string, approvalId: string, approve: boolean) {
  return apiFetch<ApprovalRequest>(
    `/workspaces/${encodeURIComponent(workspaceId)}/approvals/${encodeURIComponent(approvalId)}`,
    { method: "PATCH", body: JSON.stringify({ approve }) },
  );
}

// ---- Business workspace views ------------------------------------------------

export interface BizOverview {
  workspaceName: string;
  kpis: { l: string; v: string; d: string }[];
  approvals: ApprovalRequest[];
  spend: { l: string; icon: string; v: string; w: string; c: string }[];
}

export function getBizOverview(workspaceId: string) {
  return apiFetch<BizOverview>(`/account/biz-overview?workspaceId=${encodeURIComponent(workspaceId)}`);
}

export interface BizOrderRow {
  vertical: "Delivery" | "Flight";
  icon: string;
  ref: string;
  title: string;
  who: string;
  cc: string;
  amount: string;
  status: string;
  date: string;
}

export function getBizOrders(workspaceId: string) {
  return apiFetch<BizOrderRow[]>(`/account/biz-orders?workspaceId=${encodeURIComponent(workspaceId)}`);
}

export interface BizBilling {
  currentStatement: string;
  costCentres: { n: string; l: string; t: string; tot: string }[];
  invoices: { id: string; period: string; issued: string; amount: string; status: string }[];
}

export function getBizBilling(workspaceId: string) {
  return apiFetch<BizBilling>(`/account/biz-billing?workspaceId=${encodeURIComponent(workspaceId)}`);
}

export interface BizReports {
  months: { n: string; t: string; l: string; totalCents: number }[];
  reportCards: { l: string; v: string; d: string }[];
}

export function getBizReports(workspaceId: string) {
  return apiFetch<BizReports>(`/account/biz-reports?workspaceId=${encodeURIComponent(workspaceId)}`);
}

export function centsToUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
