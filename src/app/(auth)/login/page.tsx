// ============================================================================
// Login Page
// ============================================================================

import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — PropertyPro",
  description: "Sign in to your PropertyPro account.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to manage your properties"
    >
      <LoginForm />
    </AuthCard>
  );
}