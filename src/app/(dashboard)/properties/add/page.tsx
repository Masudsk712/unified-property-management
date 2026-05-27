"use client";

import { motion } from "framer-motion";
import { PropertyForm } from "@/components/properties/property-form";
import type { CreatePropertyInput } from "@/validations";

export default function AddPropertyPage() {
  const handleSubmit = async (data: CreatePropertyInput) => {
    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error ?? "Failed to create property");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Add New Property</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to list a new property</p>
      </div>
      <PropertyForm onSubmit={handleSubmit} submitLabel="Create Property" />
    </motion.div>
  );
}