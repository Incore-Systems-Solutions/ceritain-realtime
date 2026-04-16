import type { Metadata } from "next";
import "../../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `Profil Dr. Psikolog ${username} - Care SpilltoAI`,
    description: `Halaman profil Dr. Psikolog ${username} di platform Care SpilltoAI. Konsultasi psikologi profesional dengan Kami.`,
  };
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
