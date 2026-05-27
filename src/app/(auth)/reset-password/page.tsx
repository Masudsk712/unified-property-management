// ============================================================================
// Reset Password Page
// ============================================================================

import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password — PropertyPro",
  description: "Set a new password for your PropertyPro account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set New Password"
      description="Choose a new password for your account"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}