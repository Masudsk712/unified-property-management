// ============================================================================
// Forgot Password Page
// ============================================================================

import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — PropertyPro",
  description: "Reset your PropertyPro account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      description="We'll send you a link to reset your password"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}