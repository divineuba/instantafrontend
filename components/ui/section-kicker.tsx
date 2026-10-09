export function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] tracking-[.14em] uppercase text-accent-700 mb-2.5 font-semibold">
      {children}
    </div>
  );
}
