// ============================================================================
// Auth Layout — Suspense boundary for useSearchParams in login page
// ============================================================================

import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}