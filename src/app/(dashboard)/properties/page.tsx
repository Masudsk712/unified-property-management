"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  ArrowUpDown,
  Grid3X3,
  List,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "commercial", label: "Commercial" },
  { value: "townhouse", label: "Townhouse" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Maintenance" },
  { value: "listed", label: "Listed" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rent-high", label: "Rent: High to Low" },
  { value: "rent-low", label: "Rent: Low to High" },
  { value: "name", label: "Name: A-Z" },
];

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/properties");
      const result = await res.json();
      if (!result.success) {
        setError(result.error ?? "Failed to load properties");
        return;
      }
      setProperties(result.data ?? []);
    } catch {
      setError("Failed to fetch properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete property");
        return;
      }
      toast.success("Property deleted successfully");
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete property");
    }
  };

  const filtered = properties
    .filter((p) => {
      const matchesSearch =
        (p.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.address ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.city ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || p.type === typeFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "rent-high":
          return (b.rent ?? 0) - (a.rent ?? 0);
        case "rent-low":
          return (a.rent ?? 0) - (b.rent ?? 0);
        case "name":
          return (a.title ?? "").localeCompare(b.title ?? "");
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const activeFilters = [typeFilter, statusFilter].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading..." : `${filtered.length} of ${properties.length} properties`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProperties} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/properties/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-muted/50 pl-10 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilters > 0 && (
              <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs">{activeFilters}</span>
            )}
          </Button>
          <div className="flex rounded-xl border border-input bg-muted/50 p-1">
            <button
              onClick={() => setView("grid")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                view === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-card">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Property Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className={view === "grid" ? "h-96 rounded-2xl" : "h-32 rounded-2xl"} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center">
          <div className="rounded-full bg-destructive/10 p-3 w-fit mx-auto mb-4">
            <Building2 className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to Load Properties</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchProperties}>
            <RefreshCw className="mr-2 h-4 w-4" />Try Again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {search || typeFilter || statusFilter ? "No properties match your filters" : "No Properties Yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {search || typeFilter || statusFilter
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first property."}
          </p>
          {(search || typeFilter || statusFilter) ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setTypeFilter("");
                setStatusFilter("");
              }}
            >
              <X className="mr-2 h-4 w-4" />Clear Filters
            </Button>
          ) : (
            <Link href="/properties/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />Add Property
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {filtered.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              view={view}
              onDelete={handleDelete}
              index={index}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}