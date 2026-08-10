import type { ReactNode } from "react";

export const metadata = {
  title: "blockprint demo",
  description: "A consumer of blockprint, proving the tool works.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: "2rem auto", maxWidth: 720 }}>
        {children}
      </body>
    </html>
  );
}
