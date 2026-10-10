import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Header business="logistics" />
      <main className="flex-1">
        <section className="ins-container pt-14 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-14 items-center">
          <div className="flex flex-col gap-5">
            <Skeleton variant="text" className="w-40" />
            <Skeleton variant="text" className="w-full h-12" />
            <Skeleton variant="text" className="w-3/4" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-40 rounded-md" />
              <Skeleton className="h-11 w-40 rounded-md" />
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        </section>

        <section className="ins-container pt-20">
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
