// ============================================================================
// NextAuth v5 Route Handler — catches all /api/auth/* requests
// ============================================================================

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;