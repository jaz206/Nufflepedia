import type { Metadata } from "next";
import { Cinzel, Spectral, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar";

// «Pergamino y sangre»: display serif tallada (Cinzel), cuerpo serif de
// pantalla (Spectral) y mono para datos/dados (JetBrains). next/font las
// autoaloja al compilar — sin CDN en tiempo de ejecución.
const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const body = Spectral({
  variable: "--font-sans-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-data",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nufflepedia",
  description: "Consultor de reglas, gestor de equipos y comisionado de ligas de Blood Bowl.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
