"use client";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function ConfirmedActions({
  bookingRef,
  summary,
  startIso,
}: {
  bookingRef: string;
  summary: string;
  startIso: string;
}) {
  function handleDownload() {
    window.print();
  }

  async function handleShare() {
    const text = `My Instanta Travels booking ${bookingRef}: ${summary}`;
    if (navigator.share) {
      await navigator.share({ title: "Instanta Travels e-ticket", text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  function handleAddToCalendar() {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `UID:${bookingRef}@instanta.travels`,
      `DTSTART:${startIso}`,
      `SUMMARY:${summary}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bookingRef}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2.5 flex-wrap">
      <Button variant="primary" onClick={handleDownload}>
        <Icon name="download" size={16} />
        Download PDF
      </Button>
      <Button variant="secondary" onClick={handleShare}>
        <Icon name="share" size={16} />
        Share
      </Button>
      <Button variant="secondary" onClick={handleAddToCalendar}>
        <Icon name="calendar" size={16} />
        Add to calendar
      </Button>
    </div>
  );
}
