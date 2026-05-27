"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  ChevronRight,
  Shield,
  Wifi,
  Car,
  Wind,
  Heart,
  Edit3,
  Trash2,
  Eye,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    name: string;
    description?: string | null;
    type: string;
    status: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    rent: number;
    securityDeposit: number;
    bedrooms?: number | null;
    bathrooms?: number | null;
    area?: number | null;
    squareFeet?: number | null;
    amenities?: string[];
    images?: string[];
    image?: string | null;
    units?: number;
    occupiedUnits?: number;
    monthlyRevenue?: number;
    yearBuilt?: number | null;
  };
  view?: "grid" | "list";
  onDelete?: (id: string) => void;
  index?: number;
}

const typeColors: Record<string, string> = {
  apartment: "from-blue-500/20 to-blue-600/10 text-blue-500 border-blue-500/30",
  house: "from-emerald-500/20 to-emerald-600/10 text-emerald-500 border-emerald-500/30",
  condo: "from-violet-500/20 to-violet-600/10 text-violet-500 border-violet-500/30",
  commercial: "from-orange-500/20 to-orange-600/10 text-orange-500 border-orange-500/30",
  townhouse: "from-pink-500/20 to-pink-600/10 text-pink-500 border-pink-500/30",
};

const typeIcons: Record<string, React.ElementType> = {
  apartment: Building2,
  house: Building2,
  condo: Building2,
  commercial: Building2,
  townhouse: Building2,
};

const statusConfig: Record<string, { variant: "success" | "warning" | "destructive" | "info"; label: string; dot: string }> = {
  occupied: { variant: "success", label: "Occupied", dot: "bg-emerald-500" },
  vacant: { variant: "destructive", label: "Vacant", dot: "bg-red-500" },
  maintenance: { variant: "warning", label: "Maintenance", dot: "bg-amber-500" },
  listed: { variant: "info", label: "Listed", dot: "bg-blue-500" },
};

const amenityIcons: Record<string, React.ElementType> = {
  "Air Conditioning": Wind,
  "Parking": Car,
  "Covered Parking": Car,
  "Gym": TrendingUp,
  "Pool": Sparkles,
  "Swimming Pool": Sparkles,
  "WiFi": Wifi,
  "Security Guard": Shield,
  "Gated Community": Shield,
  "CCTV": Shield,
};

export function PropertyCard({ property, view = "grid", onDelete, index = 0 }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const status = statusConfig[property.status] ?? statusConfig.vacant;
  const TypeIcon = typeIcons[property.type] ?? Building2;
  const coverImage = property.image || (property.images && property.images.length > 0 ? property.images[0] : null);
  const occupancyRate = property.units && property.units > 0
    ? Math.round(((property.occupiedUnits ?? 0) / property.units) * 100)
    : 0;

  const featuredAmenities = (property.amenities ?? []).slice(0, 3);

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative flex flex-col sm:flex-row gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
      >
        {/* Image */}
        <div className="relative h-48 sm:h-32 sm:w-48 rounded-xl overflow-hidden flex-shrink-0">
          {coverImage ? (
            <img
              src={coverImage}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <Badge variant={status.variant} className="absolute top-3 left-3 capitalize shadow-lg">
            <span className={`mr-1.5 h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate">{property.title}</h3>
              <div className="flex items-center gap-1 mt-0.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{property.city}, {property.state} {property.zipCode}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={(e) => { e.preventDefault(); setIsFavorite(!isFavorite); }}
                className={`rounded-full p-1.5 transition-colors ${
                  isFavorite ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <Link href={`/properties/${property.id}`}>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Rent</p>
                <p className="text-sm font-semibold">{formatCurrency(property.rent)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Beds</p>
                <p className="text-sm font-semibold">{property.bedrooms ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Baths</p>
                <p className="text-sm font-semibold">{property.bathrooms ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Area</p>
                <p className="text-sm font-semibold">{property.area ? `${property.area} ft²` : "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
    >
      {/* Image Section */}
      <Link href={`/properties/${property.id}`}>
        <div className="relative h-52 overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge variant={status.variant} className="capitalize shadow-lg backdrop-blur-sm">
              <span className={`mr-1.5 h-2 w-2 rounded-full ${status.dot} animate-pulse`} />
              {status.label}
            </Badge>
            <Badge
              variant="glass"
              className={`bg-gradient-to-r ${typeColors[property.type]?.split(" ")[0] ?? "from-muted"} to-transparent backdrop-blur-sm border`}
            >
              <TypeIcon className="mr-1 h-3 w-3" />
              {property.type}
            </Badge>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white/90 text-2xl font-bold drop-shadow-lg">
              {formatCurrency(property.rent)}
              <span className="text-sm font-normal text-white/70">/mo</span>
            </p>
          </div>

          {/* Image Count */}
          {property.images && property.images.length > 1 && (
            <div className="absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-xs text-white">
              {property.images.length} photos
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title & Location */}
        <div>
          <Link href={`/properties/${property.id}`}>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{property.city}, {property.state} {property.zipCode}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-lg bg-muted/50 py-2 px-1">
            <Bed className="h-4 w-4 text-muted-foreground mb-0.5" />
            <span className="text-xs text-muted-foreground">Beds</span>
            <span className="text-sm font-semibold">{property.bedrooms ?? "-"}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-muted/50 py-2 px-1">
            <Bath className="h-4 w-4 text-muted-foreground mb-0.5" />
            <span className="text-xs text-muted-foreground">Baths</span>
            <span className="text-sm font-semibold">{property.bathrooms ?? "-"}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-muted/50 py-2 px-1">
            <Ruler className="h-4 w-4 text-muted-foreground mb-0.5" />
            <span className="text-xs text-muted-foreground">Area</span>
            <span className="text-sm font-semibold">{property.area ? `${property.area}` : "-"}</span>
          </div>
        </div>

        {/* Occupancy Bar */}
        {property.units && property.units > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Occupancy</span>
              <span className="font-medium">{occupancyRate}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${occupancyRate}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={cn(
                  "h-full rounded-full",
                  occupancyRate > 80 ? "bg-emerald-500" : occupancyRate > 40 ? "bg-amber-500" : "bg-red-500"
                )}
              />
            </div>
          </div>
        )}

        {/* Amenities */}
        {featuredAmenities.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {featuredAmenities.map((amenity) => {
              const Icon = amenityIcons[amenity] ?? Sparkles;
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <Icon className="h-3 w-3" />
                  {amenity}
                </span>
              );
            })}
            {property.amenities && property.amenities.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <Link href={`/properties/${property.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              View Details
            </Button>
          </Link>
          <Link href={`/properties/${property.id}/edit`}>
            <Button variant="ghost" size="icon-sm" className="rounded-lg">
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to delete this property?")) {
                  onDelete(property.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}