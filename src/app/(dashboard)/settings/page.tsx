"use client";

import { currentUser } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Settings, User, Bell, Shield, Palette, Building2,
  Mail, Phone, MapPin, Camera, Moon, Sun, Globe,
  Save, Key, CreditCard, Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "organization", label: "Organization", icon: Building2 },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme } = useTheme();

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="flex gap-4"><Skeleton className="h-96 w-64" /><Skeleton className="h-96 flex-1 rounded-xl" /></div></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl border border-border bg-card p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={currentUser.image ?? undefined} alt={currentUser.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-border" />
                  <button className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold">{currentUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">{currentUser.role}</Badge>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full Name" defaultValue={currentUser.name} icon={<User className="h-4 w-4" />} />
                <Input label="Email" defaultValue={currentUser.email} icon={<Mail className="h-4 w-4" />} />
                <Input label="Phone" defaultValue={currentUser.phone ?? undefined} icon={<Phone className="h-4 w-4" />} />
                <Input label="Role" defaultValue={currentUser.role} disabled icon={<Users className="h-4 w-4" />} />
              </div>
              <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Appearance</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "light", label: "Light", icon: Sun, desc: "Clean and bright" },
                    { id: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
                    { id: "system", label: "System", icon: Globe, desc: "Follows your OS" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:border-primary/50",
                        theme === opt.id ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <opt.icon className="h-6 w-6" />
                      <span className="font-medium text-sm">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Email Notifications", desc: "Receive updates via email" },
                  { label: "Push Notifications", desc: "Get push notifications in browser" },
                  { label: "Maintenance Alerts", desc: "Get notified about maintenance requests" },
                  { label: "Booking Reminders", desc: "Reminders for upcoming bookings" },
                  { label: "Weekly Reports", desc: "Receive weekly portfolio summary" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/50">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Security</h2>
              <div className="space-y-4">
                <Input label="Current Password" type="password" placeholder="Enter current password" />
                <Input label="New Password" type="password" placeholder="Enter new password" />
                <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
                <Button><Key className="mr-2 h-4 w-4" /> Update Password</Button>
              </div>
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          )}

          {activeTab === "organization" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Organization</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Company Name" defaultValue="PropertyPro Inc." icon={<Building2 className="h-4 w-4" />} />
                <Input label="Website" defaultValue="propertypro.com" icon={<Globe className="h-4 w-4" />} />
                <Input label="Address" defaultValue="100 Wilshire Blvd" icon={<MapPin className="h-4 w-4" />} />
                <Input label="Phone" defaultValue="+1 (555) 000-0000" icon={<Phone className="h-4 w-4" />} />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Subscription Plan</p>
                <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="default">Enterprise</Badge>
                      <p className="text-sm text-muted-foreground mt-2">Unlimited properties, priority support, advanced analytics</p>
                    </div>
                    <Button variant="outline" size="sm"><CreditCard className="mr-2 h-4 w-4" /> Manage</Button>
                  </div>
                </div>
              </div>
              <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}