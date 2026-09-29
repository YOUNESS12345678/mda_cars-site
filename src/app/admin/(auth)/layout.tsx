import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Connexion administrateur | MDA CAR",
  robots: { index: false, follow: false },
};

export default async function AdminAuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Already signed in — no reason to show the login form again.
  const admin = await getSessionAdmin();
  if (admin) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-4 py-12">
      {children}
    </div>
  );
}
