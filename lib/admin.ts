import { apiFetch } from "@/lib/api";

export type AdminRole =
  | "SUPER_ADMIN"
  | "OPS_MANAGER"
  | "LOGISTICS_MANAGER"
  | "TRAVEL_MANAGER"
  | "FINANCE_MANAGER"
  | "CONTENT_MANAGER"
  | "SUPPORT_MANAGER";

export type PermissionLevel = "F" | "E" | "V" | "N";
export type PermissionDomain =
  | "group"
  | "logistics"
  | "travels"
  | "crypto"
  | "dating"
  | "orders"
  | "finance"
  | "content"
  | "support"
  | "users";

export interface AdminNavItem {
  key: string;
  label: string;
  icon: string;
  badge: string;
  href: string;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export interface AdminMe {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: AdminRole;
  roleLabel: string;
  roleDescription: string;
  permissions: Record<PermissionDomain, PermissionLevel>;
  nav: AdminNavGroup[];
}

export function getAdminMe() {
  return apiFetch<AdminMe>("/admin/me");
}

// ---- Overview --------------------------------------------------------------

export type BizFilter = "all" | "logistics" | "travels";

export interface AdminOverview {
  bizName: string;
  bizIcon: string;
  ovTitle: string;
  kpis: { l: string; v: string; d: string; dc: string }[];
  legend: { n: string; c: string }[];
  days: { l: string; t: string }[];
  panels: { icon: string; title: string; href: string; stats: { l: string; v: string; c: string }[] }[];
  actions: { icon: string; t: string; d: string; href: string; bg: string; fg: string }[];
}

export function getAdminOverview(biz: BizFilter = "all") {
  return apiFetch<AdminOverview>(`/admin/overview?biz=${biz}`);
}

// ---- Customers / businesses -------------------------------------------------

export interface AdminCustomer {
  id: string;
  n: string;
  e: string;
  t: string;
  uses: { icon: string; l: string }[];
  s: string;
  v: string;
  st: string;
  sbg: string;
  sfg: string;
  ini: string;
}

export function getAdminCustomers() {
  return apiFetch<AdminCustomer[]>("/admin/customers");
}

export interface AdminBusinessCard {
  n: string;
  icon: string;
  d: string;
  st: string;
  mods: string[];
  sbg: string;
  sfg: string;
  border: string;
  ibg: string;
  ifg: string;
}

export function getAdminBusinesses() {
  return apiFetch<AdminBusinessCard[]>("/admin/businesses");
}

// ---- Deliveries --------------------------------------------------------------

export type DeliveriesTab = "del" | "riders" | "zones" | "failed";

export interface AdminDeliveryRow {
  id: string;
  cust: string;
  route: string;
  opt: string;
  rider: string;
  eta: string;
  fee: string;
  status: string;
  sbg: string;
  sfg: string;
}

export interface AdminRiderRow {
  n: string;
  v: string;
  z: string;
  t: string;
  o: string;
  r: string;
  s: string;
  sbg: string;
  sfg: string;
}

export interface AdminRidersResponse {
  fleetStats: { l: string; v: string }[];
  riders: AdminRiderRow[];
}

export interface AdminZoneRow {
  id: string;
  n: string;
  c: string;
  s: string;
  e: string;
  sd: string;
  k: string;
  st: string;
  sbg: string;
  sfg: string;
}

export interface AdminFailedDeliveryRow {
  id: string;
  c: string;
  r: string;
  a: string;
  o: string;
}

export function getAdminDeliveries(tab: DeliveriesTab = "del") {
  return apiFetch<AdminDeliveryRow[] | AdminRidersResponse | AdminZoneRow[] | AdminFailedDeliveryRow[]>(
    `/admin/deliveries?tab=${tab}`,
  );
}

export function refundDelivery(id: string) {
  return apiFetch<{ ok: true }>(`/admin/deliveries/${encodeURIComponent(id)}/refund`, { method: "POST" });
}

export function reattemptDelivery(id: string) {
  return apiFetch<unknown>(`/admin/deliveries/${encodeURIComponent(id)}/reattempt`, { method: "POST" });
}

// ---- Pricing rules --------------------------------------------------------------

export type PricingRuleType = "SPEED" | "WEIGHT_BAND" | "DISTANCE_RATE" | "INSURANCE";

export interface AdminPricingRule {
  id: string;
  type: PricingRuleType;
  code: string;
  label: string;
  amount: number;
  updatedAt: string;
}

export function getAdminPricingRules() {
  return apiFetch<AdminPricingRule[]>("/admin/pricing");
}

export function createPricingRule(input: { type: PricingRuleType; code: string; label: string; amount: number }) {
  return apiFetch<AdminPricingRule>("/admin/pricing", { method: "POST", body: JSON.stringify(input) });
}

export function updatePricingRule(id: string, input: { label: string; amount: number }) {
  return apiFetch<AdminPricingRule>(`/admin/pricing/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deletePricingRule(id: string) {
  return apiFetch<{ ok: true }>(`/admin/pricing/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---- Bookings ------------------------------------------------------------------

export type BookingsTab = "book" | "refunds" | "routes" | "docs";

export interface AdminBookingRow {
  pnr: string;
  p: string;
  r: string;
  a: string;
  d: string;
  ag: string;
  t: string;
  s: string;
  sbg: string;
  sfg: string;
}

export interface AdminRefundRow {
  id: string;
  pnr: string;
  p: string;
  t: string;
  r: string;
  a: string;
}

export interface AdminRouteRow {
  r: string;
  a: string;
  b: string;
  f: string;
  m: string;
  s: string;
  sbg: string;
  sfg: string;
}

export interface AdminDocsEmpty {
  empty: true;
  message: string;
  sub: string;
}

export interface AdminDocRow {
  id: string;
  pnr: string;
  p: string;
  label: string;
  url: string;
  uploadedAt: string;
}

export function getAdminBookings(tab: BookingsTab = "book") {
  return apiFetch<AdminBookingRow[] | AdminRefundRow[] | AdminRouteRow[] | AdminDocRow[] | AdminDocsEmpty>(
    `/admin/bookings?tab=${tab}`,
  );
}

export function approveRefund(bookingRef: string) {
  return apiFetch<unknown>(`/admin/bookings/${encodeURIComponent(bookingRef)}/refund/approve`, { method: "POST" });
}

export function rejectRefund(bookingRef: string) {
  return apiFetch<unknown>(`/admin/bookings/${encodeURIComponent(bookingRef)}/refund/reject`, { method: "POST" });
}

export function reviewTravelDocument(id: string, action: "APPROVE" | "REJECT", note?: string) {
  return apiFetch<unknown>(`/admin/bookings/documents/${encodeURIComponent(id)}/review`, {
    method: "POST",
    body: JSON.stringify({ action, note }),
  });
}

// ---- Finance -------------------------------------------------------------------

export interface AdminFinance {
  finKpis: { l: string; v: string; d: string }[];
  revByBiz: { icon: string; n: string; v: string; w: string; c: string }[];
  settlements: { n: string; d: string; a: string; s: string; sbg: string; sfg: string }[];
  finTx: { id: string; d: string; c: string; b: string; icon: string; m: string; a: string; s: string; sbg: string; sfg: string }[];
}

export function getAdminFinance() {
  return apiFetch<AdminFinance>("/admin/finance");
}

// ---- Crypto ---------------------------------------------------------------------

export interface AdminCrypto {
  cryptoKpis: { l: string; v: string; d: string }[];
  assetBreakdown: { icon: string; n: string; v: string; w: string; c: string }[];
  txTypeBreakdown: { n: string; d: string; a: string; s: string; sbg: string; sfg: string }[];
  cryptoTx: { id: string; d: string; c: string; b: string; icon: string; m: string; a: string; s: string; sbg: string; sfg: string }[];
}

export function getAdminCrypto() {
  return apiFetch<AdminCrypto>("/admin/crypto");
}

// ---- Dating (Love) ---------------------------------------------------------------

export interface AdminDating {
  datingKpis: { l: string; v: string; d: string }[];
  genderBreakdown: { icon: string; n: string; v: string; w: string; c: string }[];
  activityBreakdown: { n: string; d: string; a: string; s: string; sbg: string; sfg: string }[];
  datingRows: { id: string; d: string; c: string; icon: string; m: string; a: string; s: string; sbg: string; sfg: string }[];
}

export function getAdminDating() {
  return apiFetch<AdminDating>("/admin/dating");
}

export interface AdminDatingPhoto {
  id: string;
  url: string;
  displayName: string;
  userId: string;
  city: string;
  submittedAt: string;
}

export function getAdminDatingPhotoQueue() {
  return apiFetch<AdminDatingPhoto[]>("/admin/dating/photos");
}

export function moderateAdminDatingPhoto(id: string, action: "APPROVE" | "REJECT") {
  return apiFetch<unknown>(`/admin/dating/photos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

export interface AdminDatingReport {
  id: string;
  reporterId: string;
  reportedId: string;
  reporterName: string;
  reportedName: string;
  reason: string;
  details: string | null;
  createdAt: string;
}

export function getAdminDatingReportQueue() {
  return apiFetch<AdminDatingReport[]>("/admin/dating/reports");
}

export function resolveAdminDatingReport(id: string, action: "DISMISS" | "WARN" | "SUSPEND", note?: string) {
  return apiFetch<unknown>(`/admin/dating/reports/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ action, note }),
  });
}

// ---- Reports --------------------------------------------------------------------

export interface AdminReports {
  reportTabs: { l: string; active: boolean }[];
  repTitle: string;
  repKpis: { l: string; v: string; d: string; p: string }[];
  repBars: { n: string; p: string; c: string }[];
  cities: { n: string; o: string; c: string; cc: string }[];
}

export function getAdminReports(rep: number) {
  return apiFetch<AdminReports>(`/admin/reports?rep=${rep}`);
}

// ---- Content / CMS ----------------------------------------------------------------

export interface AdminCmsPage {
  id: string;
  n: string;
  icon: string;
  s: string;
  sbg: string;
  sfg: string;
  blocks: { icon: string; t: string; d: string }[];
  updatedAt: string;
}

export function getAdminContent() {
  return apiFetch<AdminCmsPage[]>("/admin/content");
}

export function createCmsPage(input: { name: string; icon: string }) {
  return apiFetch<unknown>("/admin/content", { method: "POST", body: JSON.stringify(input) });
}

export function updateCmsPageStatus(id: string, status: "PUBLISHED" | "DRAFT" | "IN_REVIEW") {
  return apiFetch<unknown>(`/admin/content/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---- Promotions -----------------------------------------------------------------

export interface AdminPromotion {
  id: string;
  n: string;
  a: string;
  b: string;
  icon: string;
  pl: string;
  r: string;
  s: string;
  sbg: string;
  sfg: string;
}

export function getAdminPromotions() {
  return apiFetch<AdminPromotion[]>("/admin/promotions");
}

export function createPromotion(input: {
  name: string;
  audience: string;
  business: string;
  icon: string;
  placement: string;
  dateRange: string;
}) {
  return apiFetch<unknown>("/admin/promotions", { method: "POST", body: JSON.stringify(input) });
}

export function updatePromotionStatus(
  id: string,
  status: "SCHEDULED" | "LIVE" | "DRAFT" | "ENDED" | "PAUSED",
) {
  return apiFetch<unknown>(`/admin/promotions/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---- Support --------------------------------------------------------------------

export interface AdminTicketRow {
  id: string;
  t: string;
  ref: string;
  c: string;
  b: string;
  icon: string;
  p: string;
  a: string;
  sla: string;
  slac: string;
  s: string;
  sbg: string;
  sfg: string;
  pbg: string;
  pfg: string;
}

export function getAdminSupport() {
  return apiFetch<AdminTicketRow[]>("/admin/support");
}

export function updateAdminTicket(
  id: string,
  input: { status?: "OPEN" | "AWAITING" | "RESOLVED" | "CLOSED"; priority?: "Low" | "Medium" | "High"; assignedTo?: string },
) {
  return apiFetch<unknown>(`/admin/support/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// ---- Users & permissions ----------------------------------------------------------

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleLabel: string;
  since: string;
}

export interface AdminRoleRow {
  n: string;
  d: string;
  u: number;
  cells: { l: string; bg: string; fg: string }[];
}

export interface AdminUsersResponse {
  admins: AdminUserRow[];
  permCols: string[];
  roles: AdminRoleRow[];
}

export function getAdminUsers() {
  return apiFetch<AdminUsersResponse>("/admin/users");
}

export function assignAdmin(input: { email: string; role: AdminRole }) {
  return apiFetch<unknown>("/admin/users", { method: "POST", body: JSON.stringify(input) });
}

export function revokeAdmin(id: string) {
  return apiFetch<unknown>(`/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---- Settings -----------------------------------------------------------------------

export interface AdminSettingCard {
  icon: string;
  t: string;
  d: string;
}

export function getAdminSettings() {
  return apiFetch<AdminSettingCard[]>("/admin/settings");
}
