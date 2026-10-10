import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata("اعلان‌ها");

export default function NotificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
