import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Header business="travels" active="results" />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <Skeleton variant="text" className="w-40" />
          <Skeleton variant="text" className="w-96 h-10" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid sm:grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </main>
      <Footer />
    </>
  );
}
