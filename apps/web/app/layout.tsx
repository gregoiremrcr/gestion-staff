import type { Metadata } from "next"; import "./globals.css";
export const metadata: Metadata = { title: "Gestion Staff — Restaurant", description: "Pilotage opérationnel" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="fr"><body>{children}</body></html> }
