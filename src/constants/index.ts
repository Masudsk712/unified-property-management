import {
  LayoutDashboard,
  Building2,
  Wrench,
  Sparkles,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  Users,
  Activity,
  Home,
  DollarSign,
} from "lucide-react";

export const APP_NAME = "PropertyPro";
export const APP_DESCRIPTION = "Unified Property Management Platform";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    children: [
      { title: "Overview", href: "/dashboard", icon: "Home" },
      { title: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
      { title: "Activity Feed", href: "/dashboard/activity", icon: "Activity" },
    ],
  },
  {
    title: "Properties",
    href: "/properties",
    icon: "Building2",
    children: [
      { title: "All Properties", href: "/properties", icon: "Building2" },
      { title: "Add Property", href: "/properties/add", icon: "Building2" },
    ],
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: "Wrench",
    children: [
      { title: "Requests", href: "/maintenance", icon: "Wrench" },
      { title: "Create Request", href: "/maintenance/create", icon: "Wrench" },
    ],
  },
  {
    title: "Amenities",
    href: "/amenities",
    icon: "Sparkles",
    children: [
      { title: "All Amenities", href: "/amenities", icon: "Sparkles" },
      { title: "Bookings", href: "/amenities/bookings", icon: "CalendarDays" },
    ],
  },
  {
    title: "Tenants",
    href: "/tenants",
    icon: "Users",
  },
  {
    title: "Payments",
    href: "/payments",
    icon: "DollarSign",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: "Bell",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
  },
];

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  Wrench,
  Sparkles,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  Users,
  Activity,
  Home,
  DollarSign,
};

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "commercial", label: "Commercial" },
  { value: "townhouse", label: "Townhouse" },
] as const;

export const PROPERTY_STATUSES = [
  { value: "occupied", label: "Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "listed", label: "Listed" },
] as const;

export const MAINTENANCE_CATEGORIES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "structural", label: "Structural" },
  { value: "appliance", label: "Appliance" },
  { value: "pest", label: "Pest Control" },
  { value: "other", label: "Other" },
] as const;

export const MAINTENANCE_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "emergency", label: "Emergency" },
] as const;

export const MAINTENANCE_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

export const AMENITY_TYPES = [
  { value: "gym", label: "Gym" },
  { value: "pool", label: "Pool" },
  { value: "clubhouse", label: "Clubhouse" },
  { value: "bbq", label: "BBQ Area" },
  { value: "playground", label: "Playground" },
  { value: "parking", label: "Parking" },
  { value: "rooftop", label: "Rooftop" },
  { value: "lounge", label: "Lounge" },
  { value: "other", label: "Other" },
] as const;

export const BOOKING_STATUSES = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
] as const;