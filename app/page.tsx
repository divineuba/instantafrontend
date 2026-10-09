import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";

export default function Home() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1">
        <section className="ins-container py-24">
          <Tag variant="accent">Phase 0 — foundations</Tag>
          <h1 className="mt-4 text-[clamp(52px,6.4vw,96px)]">
            One group. Many ways to move forward.
          </h1>
          <p className="max-w-xl text-neutral-700 mt-4">
            Design tokens, core UI primitives, and shared chrome (header +
            footer) are live. The group homepage, Logistics, Travels,
            Account and Admin experiences land in the next phases.
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="primary">Explore our services</Button>
            <Button variant="secondary">Get started</Button>
          </div>
        </section>

        <section className="ins-container pb-24">
          <Card className="max-w-sm">
            <CardKicker>Instanta Logistics</CardKicker>
            <CardTitle>Move anything, anywhere.</CardTitle>
            <CardBody>
              Send a package, track it live, or plug in business delivery —
              one account, one invoice.
            </CardBody>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
