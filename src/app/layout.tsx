import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Setara — Beda Titik, Setara Mimpi",
  description:
    "Jelajahi kesempatan pendidikan Indonesia lewat peta 38 provinsi, cerita, simulator, dan kuis interaktif.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
