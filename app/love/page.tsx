"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";

const ANSWERS: { icon: IconName; q: string; title: string; body: string }[] = [
  { icon: "heart", q: "What", title: "Swipe to match", body: "Like someone back and you're instantly matched — no waiting, no awkward first move." },
  { icon: "chat", q: "Chat", title: "Message your matches", body: "Once you match, chat right inside Instanta — no need to swap numbers first." },
  { icon: "pin", q: "Local", title: "People near you", body: "Discover profiles from your own city, so your first date is never a flight away." },
  { icon: "shield", q: "Safety", title: "Your call, always", body: "Pass on anyone, anytime — you only ever hear from people you've matched with." },
];

export default function LoveHomePage() {
  return (
    <>
      <Header business="love" active="home" />
      <main className="flex-1">
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1fr)_420px] gap-14 items-center">
          <div className="flex flex-col gap-5 pt-3">
            <span className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold">
              Instanta Love
            </span>
            <h1 className="text-[clamp(36px,4.8vw,64px)] leading-[1.05]">
              Meet someone new, today.
            </h1>
            <p className="text-lg text-neutral-700 max-w-lg">
              Build a profile, discover people nearby, and start chatting the
              moment you both say yes.
            </p>
            <div className="flex gap-3 flex-wrap">
              <LinkButton href="/love/discover" variant="primary" className="text-base px-6 py-3">
                Start matching
              </LinkButton>
              <LinkButton href="/love/matches" variant="secondary" className="text-base px-6 py-3">
                Your matches
              </LinkButton>
            </div>
          </div>
          <div className="p-8 flex flex-col items-center gap-4 bg-card border border-divider rounded-2xl shadow-md">
            <span className="size-20 grid place-items-center bg-accent-100 text-accent-700 rounded-full">
              <Icon name="heart" size={36} />
            </span>
            <p className="text-sm text-neutral-700 text-center m-0">
              Create your profile once, then swipe through people near you.
              Mutual likes become matches you can chat with instantly.
            </p>
          </div>
        </section>

        <section className="ins-container pt-24">
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {ANSWERS.map((a) => (
              <div key={a.title} className="flex flex-col gap-2.5">
                <div className="flex justify-between items-start text-accent">
                  <Icon name={a.icon} size={28} />
                  <span className="text-xs text-neutral-600">{a.q}</span>
                </div>
                <div className="text-xl font-semibold leading-tight">{a.title}</div>
                <p className="text-sm text-neutral-700 m-0">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ins-container pt-24 pb-24">
          <div className="bg-accent-900 text-white p-6 sm:p-10 rounded-2xl flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="mr-auto">
              <div className="text-2xl md:text-4xl font-semibold leading-tight">
                Ready to meet someone?
              </div>
              <div className="text-[15px] text-accent-200 mt-1.5">
                Set up your profile and start discovering people today.
              </div>
            </div>
            <Link
              href="/love/discover"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-[7px] whitespace-nowrap cursor-pointer font-semibold text-sm rounded-[0.4rem] border border-white bg-white text-accent-900 hover:bg-accent-100 h-11 px-4 no-underline"
            >
              Start matching
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
