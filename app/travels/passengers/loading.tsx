import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Header business="travels" active="results" />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <div className="flex flex-col gap-4">
          <Skeleton variant="text" className="w-48 h-7" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </main>
      <Footer />
    </>
  );
}
