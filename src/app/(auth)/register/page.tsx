// ============================================================================
// Register Page
// ============================================================================

import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account — PropertyPro",
  description: "Create your PropertyPro account.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create Account"
      description="Get started with PropertyPro"
    >
      <RegisterForm />
    </AuthCard>
  );
}