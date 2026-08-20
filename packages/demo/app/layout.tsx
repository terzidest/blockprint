import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "blockprint — typed, config-driven block rendering for React",
  description:
    "One renderer, one registry, three completely different pages from JSON — plus graceful failure when the config is broken.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
