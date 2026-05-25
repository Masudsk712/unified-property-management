"use client";

import { amenities } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Clock, Users, MapPin, Search, CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";

const typeIcons: Record<string, React.ElementType> = {
  gym: Sparkles, pool: Sparkles, clubhouse: Sparkles, bbq: Sparkles,
  playground: Sparkles, parking: Sparkles, rooftop: Sparkles, lounge: Sparkles, other: Sparkles,
};

export default function AmenitiesPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  const filtered = amenities.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => (<Skeleton key={i} className="h-72 rounded-xl" />))}</div></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Amenities</h1>
          <p className="text-muted-foreground mt-1">Explore and book shared amenities</p>
        </div>
        <Link href="/amenities/bookings"><Button variant="outline"><CalendarDays className="mr-2 h-4 w-4" /> View Bookings</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Search amenities..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-10 pr-4 text-sm" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((amenity) => (
          <motion.div key={amenity.id} whileHover={{ y: -4 }} className="card-lift group overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative h-48 overflow-hidden">
              <img src={amenity.image ?? undefined} alt={amenity.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 right-3">
                <Badge variant="glass" className="text-white border-white/20 capitalize">{amenity.type}</Badge>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-lg">{amenity.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{amenity.description}</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Capacity: {amenity.capacity}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {amenity.openTime} - {amenity.closeTime}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <Badge variant={amenity.status === "available" ? "success" : "warning"} className="capitalize">{amenity.status}</Badge>
                {amenity.requiresBooking && (
                  <Button size="sm" variant="outline">
                    Book Now <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}