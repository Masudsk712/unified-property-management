"use client";

import { properties } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  DollarSign,
  ArrowUpDown,
  Grid3X3,
  List,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<string, "success" | "warning" | "destructive" | "info"> = {
  occupied: "success",
  vacant: "destructive",
  maintenance: "warning",
  listed: "info",
};

const typeColors: Record<string, string> = {
  apartment: "bg-blue-500/10 text-blue-500",
  house: "bg-emerald-500/10 text-emerald-500",
  condo: "bg-violet-500/10 text-violet-500",
  commercial: "bg-orange-500/10 text-orange-500",
  townhouse: "bg-pink-500/10 text-pink-500",
};

export default function PropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  const filtered = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your property portfolio</p>
        </div>
        <Link href="/properties/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-10 pr-4 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
          </Button>
          <div className="flex rounded-lg border border-input p-1">
            <button
              onClick={() => setView("grid")}
              className={`rounded-md p-1.5 ${view === "grid" ? "bg-muted" : ""}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-md p-1.5 ${view === "list" ? "bg-muted" : ""}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
        {filtered.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <motion.div
              whileHover={{ y: -4 }}
              className={
                view === "grid"
                  ? "card-lift group overflow-hidden rounded-xl border border-border bg-card"
                  : "flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all"
              }
            >
              {view === "grid" && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.image ?? undefined}
                    alt={property.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <Badge variant={statusColors[property.status]}>
                      {property.status}
                    </Badge>
                    <Badge variant="glass" className="text-white border-white/20">
                      <Building2 className="mr-1 h-3 w-3" />
                      {property.type}
                    </Badge>
                  </div>
                </div>
              )}

              <div className={view === "grid" ? "p-5" : "flex-1"}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{property.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {property.city}, {property.state} {property.zipCode}
                    </div>
                  </div>
                  {view === "list" && (
                    <Badge variant={statusColors[property.status]}>
                      {property.status}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Units</p>
                    <p className="font-semibold">
                      {property.occupiedUnits}/{property.units}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue/mo</p>
                    <p className="font-semibold">{formatCurrency(property.monthlyRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                    <p className="font-semibold">
                      {Math.round((property.occupiedUnits / property.units) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[property.type]}`}>
                      {property.type}
                    </span>
                  </div>
                </div>
              </div>

              {view === "list" && (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}