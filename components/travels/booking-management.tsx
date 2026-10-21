"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  getFlightStatus,
  cancelBooking,
  presignTravelDocument,
  addTravelDocument,
  type Booking,
  type LegFlightStatus,
  type TravelDocContentType,
} from "@/lib/travels";

const STATUS_LABEL: Record<LegFlightStatus["flightStatus"], string> = {
  SCHEDULED: "Scheduled",
  ON_TIME: "On time",
  DELAYED: "Delayed",
  DEPARTED: "Departed",
  ARRIVED: "Arrived",
  CANCELLED: "Cancelled",
  UNKNOWN: "Status unavailable",
};

const STATUS_COLOR: Record<LegFlightStatus["flightStatus"], string> = {
  SCHEDULED: "bg-neutral-200 text-neutral-800",
  ON_TIME: "bg-accent-100 text-accent-800",
  DELAYED: "bg-[#fbe7e9] text-error",
  DEPARTED: "bg-accent-100 text-accent-800",
  ARRIVED: "bg-neutral-200 text-neutral-800",
  CANCELLED: "bg-[#fbe7e9] text-error",
  UNKNOWN: "bg-neutral-200 text-neutral-600",
};

function FlightStatusSection({ bookingId, legCount }: { bookingId: string; legCount: number }) {
  const [statuses, setStatuses] = React.useState<LegFlightStatus[] | null>(null);
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Live status is a genuine fetch-on-mount sync with an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getFlightStatus(bookingId)
      .then((res) => setStatuses(res.statuses))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="text-sm text-neutral-600">Checking live flight status…</div>;
  if (error || !statuses?.length) {
    return <div className="text-sm text-neutral-600">Live flight status isn&apos;t available for this booking right now.</div>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {statuses.map((s) => (
        <div key={s.sequence} className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 text-sm">
            <Icon name="plane" size={15} className="text-neutral-600" />
            <span className="font-medium">{s.flightNo}</span>
            {legCount > 2 && <span className="text-neutral-600">· Flight {s.sequence + 1}</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-700 flex-wrap">
            {s.departureGate && <span>Gate {s.departureGate}</span>}
            {s.departureTerminal && <span>Terminal {s.departureTerminal}</span>}
            <span className={`px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[s.flightStatus]}`}>
              {STATUS_LABEL[s.flightStatus]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentsSection({ booking, onUploaded }: { booking: Booking; onUploaded: (doc: Booking["documents"][number]) => void }) {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const CONTENT_TYPES: Record<string, TravelDocContentType> = {
    "image/jpeg": "image/jpeg",
    "image/png": "image/png",
    "image/webp": "image/webp",
    "application/pdf": "application/pdf",
  };

  async function handleFile(file: File) {
    const contentType = CONTENT_TYPES[file.type];
    if (!contentType) {
      setError("Upload a JPEG, PNG, WebP or PDF file.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const presigned = await presignTravelDocument(booking.id, contentType);
      const putRes = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed");
      const doc = await addTravelDocument(booking.id, {
        key: presigned.key,
        url: presigned.publicUrl,
        label: file.name,
      });
      onUploaded(doc);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't upload that file. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {booking.documents.length > 0 && (
        <div className="flex flex-col gap-2">
          {booking.documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 text-sm">
              <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent-700 no-underline hover:underline truncate">
                <Icon name="file" size={14} />
                {d.label}
              </a>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                  d.status === "APPROVED"
                    ? "bg-accent-100 text-accent-800"
                    : d.status === "REJECTED"
                      ? "bg-[#fbe7e9] text-error"
                      : "bg-neutral-200 text-neutral-700"
                }`}
              >
                {d.status === "PENDING" ? "Under review" : d.status === "APPROVED" ? "Approved" : "Rejected"}
              </span>
            </div>
          ))}
        </div>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button variant="secondary" disabled={uploading} onClick={() => fileInput.current?.click()}>
        <Icon name="plus" size={14} />
        {uploading ? "Uploading…" : "Upload a document"}
      </Button>
      {error && <p className="text-sm text-error m-0">{error}</p>}
    </div>
  );
}

function CancelSection({ booking, onCancelled }: { booking: Booking; onCancelled: (booking: Booking) => void }) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pendingRefund = booking.refundRequests.find((r) => r.status === "PENDING");

  if (booking.status === "CANCELLED") {
    return <div className="text-sm text-neutral-700">This booking has been cancelled.</div>;
  }
  if (pendingRefund) {
    return <div className="text-sm text-neutral-700">A cancellation request is already under review.</div>;
  }

  async function handleCancel() {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await cancelBooking(booking.id, reason || undefined);
      onCancelled(updated);
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit the cancellation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <Icon name="x" size={14} />
        Cancel booking
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value.slice(0, 500))}
        placeholder="Reason for cancelling (optional)"
        className="w-full min-h-[70px] p-2.5 text-sm border border-neutral-300 rounded-md"
      />
      <div className="flex gap-2.5">
        <Button variant="primary" disabled={submitting} onClick={handleCancel}>
          {submitting ? "Submitting…" : "Submit cancellation"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Keep booking
        </Button>
      </div>
      {error && <p className="text-sm text-error m-0">{error}</p>}
    </div>
  );
}

export function BookingManagement({ booking: initialBooking }: { booking: Booking }) {
  const [booking, setBooking] = React.useState(initialBooking);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-5 border border-divider rounded-xl bg-card flex flex-col gap-3">
        <span className="text-sm font-semibold">Flight status</span>
        <FlightStatusSection bookingId={booking.id} legCount={booking.offer.legs.length} />
      </div>
      <div className="p-5 border border-divider rounded-xl bg-card flex flex-col gap-3">
        <span className="text-sm font-semibold">Travel documents</span>
        <DocumentsSection
          booking={booking}
          onUploaded={(doc) => setBooking((b) => ({ ...b, documents: [...b.documents, doc] }))}
        />
      </div>
      <div className="p-5 border border-divider rounded-xl bg-card flex flex-col gap-3">
        <span className="text-sm font-semibold">Need to cancel?</span>
        <CancelSection booking={booking} onCancelled={setBooking} />
      </div>
    </div>
  );
}
