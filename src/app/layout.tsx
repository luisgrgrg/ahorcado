import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahorcado Aventuras",
  description: "Juego casual del ahorcado con sesión, historial y diseño accesible.",
};

export const viewport: Viewport = {
  themeColor: "#5368d9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
