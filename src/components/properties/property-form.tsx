"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPropertySchema, type CreatePropertyInput } from "@/validations";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./image-upload";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Ruler,
  Warehouse,
  Check,
  Loader2,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Layers,
  Home,
  List,
  AlertCircle,
} from "lucide-react";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "commercial", label: "Commercial" },
  { value: "townhouse", label: "Townhouse" },
];

const STATUS_OPTIONS = [
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "listed", label: "Listed" },
];

const AMENITY_OPTIONS = [
  "Air Conditioning",
  "Balcony",
  "CCTV",
  "Clubhouse",
  "Covered Parking",
  "Dishwasher",
  "Elevator",
  "Fireplace",
  "Furnished",
  "Garden",
  "Gated Community",
  "Gym",
  "Heating",
  "In-unit Laundry",
  "Intercom",
  "Lawn",
  "Parking",
  "Patio",
  "Pet Friendly",
  "Playground",
  "Pool",
  "Power Backup",
  "Rooftop",
  "Security Guard",
  "Storage",
  "Swimming Pool",
  "Terrace",
  "Walk-in Closet",
  "Washer/Dryer",
  "WiFi",
];

interface PropertyFormProps {
  defaultValues?: Partial<CreatePropertyInput>;
  onSubmit: (data: CreatePropertyInput) => Promise<void>;
  submitLabel?: string;
  isEdit?: boolean;
}

export function PropertyForm({
  defaultValues,
  onSubmit,
  submitLabel = "Add Property",
  isEdit = false,
}: PropertyFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "images" | "amenities">("basic");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<CreatePropertyInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createPropertySchema) as any,
    defaultValues: {
      title: "",
      name: "",
      description: "",
      type: "apartment",
      status: "vacant",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      rent: 0,
      securityDeposit: 0,
      bedrooms: undefined,
      bathrooms: undefined,
      area: undefined,
      squareFeet: undefined,
      amenities: [],
      images: [],
      image: "",
      units: 1,
      occupiedUnits: 0,
      monthlyRevenue: 0,
      yearBuilt: undefined,
      ...defaultValues,
    },
  });

  const watchAmenities = watch("amenities") ?? [];

  const handleFormSubmit = async (data: CreatePropertyInput) => {
    setSubmitting(true);
    try {
      // Ensure images array is set and first image is cover
      const formattedData = {
        ...data,
        image: data.images && data.images.length > 0 ? data.images[0] : undefined,
        description: data.description || undefined,
      };
      await onSubmit(formattedData);
      toast.success(isEdit ? "Property updated successfully!" : "Property created successfully!");
      router.push("/properties");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    const current = watch("amenities") ?? [];
    if (current.includes(amenity)) {
      setValue("amenities", current.filter((a) => a !== amenity), { shouldDirty: true });
    } else {
      setValue("amenities", [...current, amenity], { shouldDirty: true });
    }
  };

  const tabs = [
    { id: "basic" as const, label: "Basic Info", icon: Building2 },
    { id: "details" as const, label: "Details", icon: Layers },
    { id: "images" as const, label: "Images", icon: ImageIcon, count: (watch("images") ?? []).length },
    { id: "amenities" as const, label: "Amenities", icon: List, count: watchAmenities.length },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isActive ? "bg-primary/10 text-primary" : "bg-muted-foreground/10"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <motion.div
            key="basic"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Property Information</h3>
                  <p className="text-sm text-muted-foreground">Basic details about the property</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Property Title"
                    placeholder="e.g. Luxurious 3BHK Apartment in Downtown"
                    error={errors.title?.message}
                    icon={<Home className="h-4 w-4" />}
                    {...register("title")}
                  />
                </div>
                <Input
                  label="Property Name"
                  placeholder="e.g. Skyline Residency"
                  error={errors.name?.message}
                  icon={<Building2 className="h-4 w-4" />}
                  {...register("name")}
                />
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Property Type"
                      options={PROPERTY_TYPES}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.type?.message}
                    />
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Availability Status"
                      options={STATUS_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.status?.message}
                    />
                  )}
                />
                <Input
                  label="Year Built"
                  type="number"
                  placeholder="e.g. 2022"
                  icon={<Warehouse className="h-4 w-4" />}
                  {...register("yearBuilt", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-sm text-muted-foreground">Property address details</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address"
                    placeholder="e.g. 123 Main Street"
                    error={errors.address?.message}
                    icon={<MapPin className="h-4 w-4" />}
                    {...register("address")}
                  />
                </div>
                <Input
                  label="City"
                  placeholder="e.g. New York"
                  error={errors.city?.message}
                  {...register("city")}
                />
                <Input
                  label="State"
                  placeholder="e.g. NY"
                  error={errors.state?.message}
                  {...register("state")}
                />
                <Input
                  label="ZIP Code"
                  placeholder="e.g. 10001"
                  error={errors.zipCode?.message}
                  {...register("zipCode")}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Financials</h3>
                  <p className="text-sm text-muted-foreground">Rent and deposit details</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Monthly Rent"
                  type="number"
                  placeholder="e.g. 2500"
                  error={errors.rent?.message}
                  icon={<DollarSign className="h-4 w-4" />}
                  {...register("rent", { valueAsNumber: true })}
                />
                <Input
                  label="Security Deposit"
                  type="number"
                  placeholder="e.g. 2500"
                  error={errors.securityDeposit?.message}
                  icon={<DollarSign className="h-4 w-4" />}
                  {...register("securityDeposit", { valueAsNumber: true })}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-violet-500/10 p-2">
                  <Ruler className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Rooms & Area</h3>
                  <p className="text-sm text-muted-foreground">Property dimensions and rooms</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Bedrooms"
                  type="number"
                  placeholder="e.g. 3"
                  icon={<Bed className="h-4 w-4" />}
                  {...register("bedrooms", { valueAsNumber: true })}
                />
                <Input
                  label="Bathrooms"
                  type="number"
                  placeholder="e.g. 2"
                  step="0.5"
                  icon={<Bath className="h-4 w-4" />}
                  {...register("bathrooms", { valueAsNumber: true })}
                />
                <Input
                  label="Area (sq. ft.)"
                  type="number"
                  placeholder="e.g. 1200"
                  icon={<Ruler className="h-4 w-4" />}
                  {...register("area", { valueAsNumber: true })}
                />
                <Input
                  label="Square Feet"
                  type="number"
                  placeholder="e.g. 1200"
                  icon={<Ruler className="h-4 w-4" />}
                  {...register("squareFeet", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Layers className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Units & Occupancy</h3>
                  <p className="text-sm text-muted-foreground">Manage units and occupancy tracking</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Total Units"
                  type="number"
                  placeholder="1"
                  icon={<Layers className="h-4 w-4" />}
                  {...register("units", { valueAsNumber: true })}
                />
                <Input
                  label="Occupied Units"
                  type="number"
                  placeholder="0"
                  icon={<Building2 className="h-4 w-4" />}
                  {...register("occupiedUnits", { valueAsNumber: true })}
                />
                <Input
                  label="Monthly Revenue"
                  type="number"
                  placeholder="0"
                  icon={<DollarSign className="h-4 w-4" />}
                  {...register("monthlyRevenue", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-pink-500/10 p-2">
                  <Home className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-sm text-muted-foreground">Detailed description of the property</p>
                </div>
              </div>
              <div>
                <textarea
                  className="flex min-h-[120px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the property in detail... Include features, nearby landmarks, accessibility, etc."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <motion.div
            key="images"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-cyan-500/10 p-2">
                <ImageIcon className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <h3 className="font-semibold">Property Images</h3>
                <p className="text-sm text-muted-foreground">Upload up to 10 high-quality images</p>
              </div>
            </div>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value ?? []}
                  onChange={field.onChange}
                  maxFiles={10}
                  disabled={submitting}
                  label=""
                />
              )}
            />
          </motion.div>
        )}

        {/* Amenities Tab */}
        {activeTab === "amenities" && (
          <motion.div
            key="amenities"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <List className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">Amenities</h3>
                <p className="text-sm text-muted-foreground">Select all amenities available at this property</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = watchAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    {isSelected ? (
                      <div className="rounded-full bg-primary p-0.5">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          {!isValid && isDirty && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Some fields need attention
            </span>
          )}
          <Button type="submit" disabled={submitting || (!isValid && !isEdit)} size="lg">
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}