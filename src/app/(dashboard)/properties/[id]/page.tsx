"use client";

import { properties, maintenanceRequests } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin, Building2, Users, DollarSign, Calendar, Ruler,
  Clock, Wrench, Phone, Mail, ArrowLeft, Edit, TrendingUp,
  CheckCircle2, AlertCircle, ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate, formatTimeAgo } from "@/lib/utils";

const statusColors: Record<string, "success" | "warning" | "destructive" | "info"> = {
  occupied: "success", vacant: "destructive", maintenance: "warning", listed: "info",
};

const priorityColors: Record<string, string> = {
  emergency: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const maintStatusColors: Record<string, "success" | "warning" | "destructive" | "info" | "secondary"> = {
  open: "info", "in-progress": "warning", resolved: "success", closed: "secondary",
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const property = properties.find((p) => p.id === id);
  const propertyMaintenance = maintenanceRequests.filter((m) => m.propertyId === id);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 rounded-xl" /><div className="grid gap-6 lg:grid-cols-3"><Skeleton className="h-96 rounded-xl lg:col-span-2" /><Skeleton className="h-96 rounded-xl" /></div></div>;
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-bold mt-4">Property not found</h2>
        <Link href="/properties"><Button variant="outline" className="mt-4">Back to Properties</Button></Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/properties"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{property.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {property.address}, {property.city}, {property.state} {property.zipCode}
          </div>
        </div>
        <Badge variant={statusColors[property.status]} className="text-sm px-3 py-1">{property.status}</Badge>
        <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </div>

      {/* Hero Image */}
      <motion.div className="relative h-64 lg:h-96 overflow-hidden rounded-xl">
        <img src={property.image ?? undefined} alt={property.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6">
          <div className="flex gap-2">
            {property.amenities?.slice(0, 4).map((a) => (
              <Badge key={a} variant="glass" className="text-white border-white/20">{a}</Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Units", value: property.units, icon: Building2, color: "bg-blue-500/10 text-blue-500" },
          { label: "Occupied", value: `${property.occupiedUnits} (${Math.round((property.occupiedUnits / property.units) * 100)}%)`, icon: Users, color: "bg-emerald-500/10 text-emerald-500" },
          { label: "Monthly Revenue", value: formatCurrency(property.monthlyRevenue), icon: DollarSign, color: "bg-violet-500/10 text-violet-500" },
          { label: "Year Built", value: property.yearBuilt, icon: Calendar, color: "bg-orange-500/10 text-orange-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className={`rounded-lg ${stat.color} p-2.5 w-fit`}><stat.icon className="h-5 w-5" /></div>
            <p className="text-xs text-muted-foreground mt-3">{stat.label}</p>
            <p className="text-lg font-bold mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details & Description */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">Property Details</h3>
          {property.description && <p className="text-muted-foreground mb-6">{property.description}</p>}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Type", value: property.type, icon: Building2 },
              { label: "Square Feet", value: `${property.squareFeet?.toLocaleString()} sq ft`, icon: Ruler },
              { label: "Bedrooms", value: property.bedrooms || "N/A", icon: Building2 },
              { label: "Bathrooms", value: property.bathrooms || "N/A", icon: Building2 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-xs text-muted-foreground">{item.label}</p><p className="font-medium capitalize">{item.value}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">Amenities</h3>
          <div className="space-y-2">
            {property.amenities?.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {amenity}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Requests */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Maintenance Requests</h3>
            <p className="text-sm text-muted-foreground">Active and recent maintenance for this property</p>
          </div>
          <Link href="/maintenance/create"><Button size="sm"><Wrench className="mr-2 h-4 w-4" /> New Request</Button></Link>
        </div>
        {propertyMaintenance.length === 0 ? (
          <div className="text-center py-12"><CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No maintenance requests</p></div>
        ) : (
          <div className="space-y-3">
            {propertyMaintenance.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className={`rounded-full p-2 ${priorityColors[req.priority]}`}><AlertCircle className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{req.title}</p>
                    <Badge variant={maintStatusColors[req.status]} className="text-xs">{req.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Unit {req.unit} • {formatTimeAgo(req.createdAt)}</p>
                </div>
                {req.cost && <p className="text-sm font-medium">{formatCurrency(req.cost)}</p>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}