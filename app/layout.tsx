import type { Metadata } from "next";
import { Inter, Caveat, Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Instanta: deliveries, travel, crypto and dating in one account",
    template: "%s | Instanta",
  },
  description:
    "Send packages, book flights, trade crypto and meet people with one Instanta account. Logistics, Travels, Crypto and Love, built for Nigeria.",
  openGraph: {
    title: "Instanta",
    description:
      "Send packages, book flights, trade crypto and meet people with one Instanta account. Logistics, Travels, Crypto and Love, built for Nigeria.",
    images: ["/brand/mark-1024.png"],
  },
  twitter: {
    card: "summary",
    title: "Instanta",
    description:
      "Send packages, book flights, trade crypto and meet people with one Instanta account. Logistics, Travels, Crypto and Love, built for Nigeria.",
    images: ["/brand/mark-1024.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${caveat.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
