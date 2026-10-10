import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Header business="travels" active="results" />
      <main className="flex-1 ins-container pt-10 pb-24 flex flex-col gap-7 max-w-[1100px]">
        <div className="flex items-center gap-4 flex-wrap">
          <Skeleton className="size-12 rounded-[10px]" />
          <div className="mr-auto flex flex-col gap-2">
            <Skeleton variant="text" className="w-64 h-8" />
            <Skeleton variant="text" className="w-80" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
      <Footer />
    </>
  );
}
