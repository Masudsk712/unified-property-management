// ============================================================================
// Database Seed Script — Populates MongoDB with realistic demo data
// Run with: npx tsx prisma/seed.ts (after setting up the DB connection)
// Uses `prisma db push` first (no migrations needed for MongoDB)
// ============================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (order matters for relations)
  await prisma.notification.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.amenity.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("  ✓ Cleared existing data");

  // ── Users ──────────────────────────────────────────────────────────────
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Alexandra Chen",
      email: "alex@propertypro.com",
      password,
      phone: "+1 (555) 123-4567",
      role: "admin",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Michael Torres",
      email: "michael@propertypro.com",
      password,
      phone: "+1 (555) 234-5678",
      role: "manager",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      name: "Emily Davis",
      email: "emily@example.com",
      password,
      phone: "+1 (555) 345-6789",
      role: "tenant",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      name: "Mike Johnson",
      email: "mike@example.com",
      password,
      phone: "+1 (555) 456-7890",
      role: "tenant",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  });

  const tenant3 = await prisma.user.create({
    data: {
      name: "Sarah Williams",
      email: "sarah@example.com",
      password,
      phone: "+1 (555) 567-8901",
      role: "tenant",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
  });

  console.log("  ✓ Created 5 users");

  // ── Properties ─────────────────────────────────────────────────────────
  const p1 = await prisma.property.create({
    data: {
      name: "Skyline Towers",
      address: "100 Wilshire Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90024",
      type: "apartment",
      status: "occupied",
      units: 120,
      occupiedUnits: 112,
      monthlyRevenue: 324000,
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      description:
        "Luxury high-rise apartments with panoramic city views, modern amenities, and premium finishes throughout.",
      amenities: ["Pool", "Gym", "Rooftop Lounge", "Concierge", "Parking"],
      yearBuilt: 2019,
      squareFeet: 250000,
    },
  });

  const p2 = await prisma.property.create({
    data: {
      name: "Harbor View Complex",
      address: "500 Marina Drive",
      city: "San Francisco",
      state: "CA",
      zipCode: "94123",
      type: "condo",
      status: "occupied",
      units: 85,
      occupiedUnits: 76,
      monthlyRevenue: 212500,
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      description:
        "Waterfront condominiums with stunning bay views, modern kitchens, and resort-style amenities.",
      amenities: ["Pool", "Gym", "Clubhouse", "Parking", "BBQ Area"],
      yearBuilt: 2017,
      squareFeet: 180000,
    },
  });

  const p3 = await prisma.property.create({
    data: {
      name: "Greenwood Gardens",
      address: "1200 Oak Street",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      type: "townhouse",
      status: "occupied",
      units: 45,
      occupiedUnits: 41,
      monthlyRevenue: 98500,
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      description:
        "Charming townhomes in a lush garden setting, featuring private yards and modern interiors.",
      amenities: ["Playground", "BBQ Area", "Parking"],
      yearBuilt: 2020,
      squareFeet: 95000,
    },
  });

  const p4 = await prisma.property.create({
    data: {
      name: "Metro Lofts",
      address: "75 Tech Square",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      type: "apartment",
      status: "maintenance",
      units: 200,
      occupiedUnits: 178,
      monthlyRevenue: 445000,
      image:
        "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop",
      description:
        "Modern urban lofts in the heart of the tech district with smart home features and co-working spaces.",
      amenities: ["Gym", "Co-working Space", "Rooftop", "Bike Storage", "Pet Spa"],
      yearBuilt: 2021,
      squareFeet: 400000,
    },
  });

  const p5 = await prisma.property.create({
    data: {
      name: "Palm Springs Villas",
      address: "2200 Desert Palm Way",
      city: "Palm Springs",
      state: "CA",
      zipCode: "92262",
      type: "house",
      status: "listed",
      units: 30,
      occupiedUnits: 22,
      monthlyRevenue: 75000,
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      description:
        "Elegant desert villas with private pools, mountain views, and luxury finishes throughout.",
      amenities: ["Pool", "Garden", "Parking", "Clubhouse"],
      yearBuilt: 2018,
      squareFeet: 65000,
    },
  });

  const p6 = await prisma.property.create({
    data: {
      name: "The Commerce Center",
      address: "450 Business Park Ave",
      city: "Denver",
      state: "CO",
      zipCode: "80202",
      type: "commercial",
      status: "vacant",
      units: 15,
      occupiedUnits: 8,
      monthlyRevenue: 120000,
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
      description:
        "Class A commercial office space with modern infrastructure, ample parking, and great visibility.",
      amenities: ["Parking", "Security", "Elevator", "Lobby", "Conference Rooms"],
      yearBuilt: 2016,
      squareFeet: 120000,
    },
  });

  console.log("  ✓ Created 6 properties");

  // ── Tenants ────────────────────────────────────────────────────────────
  await prisma.tenant.createMany({
    data: [
      {
        userId: tenant1.id,
        propertyId: p1.id,
        unit: "12A",
        leaseStart: new Date("2025-01-01"),
        leaseEnd: new Date("2026-01-01"),
        rentAmount: 3200,
        securityDeposit: 3200,
        status: "active",
      },
      {
        userId: tenant2.id,
        propertyId: p2.id,
        unit: "5C",
        leaseStart: new Date("2025-03-01"),
        leaseEnd: new Date("2026-03-01"),
        rentAmount: 2800,
        securityDeposit: 2800,
        status: "active",
      },
      {
        userId: tenant3.id,
        propertyId: p3.id,
        unit: "22B",
        leaseStart: new Date("2025-02-01"),
        leaseEnd: new Date("2026-02-01"),
        rentAmount: 2100,
        securityDeposit: 2100,
        status: "active",
      },
    ],
  });

  console.log("  ✓ Created 3 tenants");

  // ── Amenities ──────────────────────────────────────────────────────────
  const am1 = await prisma.amenity.create({
    data: {
      propertyId: p1.id,
      name: "Rooftop Pool & Lounge",
      type: "pool",
      description: "Infinity-edge pool with panoramic city views, cabanas, and a full-service bar.",
      capacity: 50,
      openTime: "06:00",
      closeTime: "22:00",
      requiresBooking: false,
      image:
        "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&h=600&fit=crop",
      status: "available",
    },
  });

  const am2 = await prisma.amenity.create({
    data: {
      propertyId: p1.id,
      name: "Fitness Center",
      type: "gym",
      description: "State-of-the-art gym with Peloton bikes, free weights, and yoga studio.",
      capacity: 30,
      openTime: "05:00",
      closeTime: "23:00",
      requiresBooking: false,
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      status: "available",
    },
  });

  await prisma.amenity.create({
    data: {
      propertyId: p2.id,
      name: "Clubhouse & Event Space",
      type: "clubhouse",
      description: "Elegant clubhouse with full kitchen, fireplace, and space for up to 80 guests.",
      capacity: 80,
      openTime: "08:00",
      closeTime: "22:00",
      requiresBooking: true,
      image:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      status: "available",
    },
  });

  await prisma.amenity.create({
    data: {
      propertyId: p3.id,
      name: "BBQ & Picnic Area",
      type: "bbq",
      description: "Outdoor grilling stations with covered picnic tables and playground adjacent.",
      capacity: 40,
      openTime: "09:00",
      closeTime: "21:00",
      requiresBooking: true,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop",
      status: "available",
    },
  });

  await prisma.amenity.create({
    data: {
      propertyId: p4.id,
      name: "Co-working Lounge",
      type: "lounge",
      description: "Modern co-working space with private pods, high-speed WiFi, and coffee bar.",
      capacity: 25,
      openTime: "06:00",
      closeTime: "00:00",
      requiresBooking: false,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      status: "available",
    },
  });

  await prisma.amenity.create({
    data: {
      propertyId: p4.id,
      name: "Rooftop Terrace",
      type: "rooftop",
      description: "Landscaped rooftop with fire pits, lounge seating, and stunning city skyline views.",
      capacity: 60,
      openTime: "10:00",
      closeTime: "23:00",
      requiresBooking: true,
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
      status: "maintenance",
    },
  });

  console.log("  ✓ Created 6 amenities");

  // ── Maintenance Requests ───────────────────────────────────────────────
  await prisma.maintenanceRequest.createMany({
    data: [
      {
        propertyId: p1.id,
        propertyName: p1.name,
        unit: "12A",
        title: "Leaking faucet in kitchen",
        description:
          "The kitchen faucet has been dripping constantly for the past 3 days. Water is pooling underneath the sink.",
        category: "plumbing",
        priority: "medium",
        status: "open",
        requestedBy: "Mike Johnson",
        createdAt: new Date("2025-05-20T09:15:00Z"),
      },
      {
        propertyId: p2.id,
        propertyName: p2.name,
        unit: "5C",
        title: "AC not cooling properly",
        description:
          "The air conditioning unit is blowing warm air. Temperature inside unit is 82°F despite thermostat set to 72°F.",
        category: "hvac",
        priority: "high",
        status: "in-progress",
        assignedTo: manager.id,
        requestedBy: "Sarah Williams",
        cost: 450,
        createdAt: new Date("2025-05-19T14:30:00Z"),
      },
      {
        propertyId: p4.id,
        propertyName: p4.name,
        unit: "8B",
        title: "Broken elevator on east wing",
        description:
          "Elevator #3 in the east wing has stopped working. Residents are reporting being stuck for 10 minutes.",
        category: "electrical",
        priority: "emergency",
        status: "in-progress",
        assignedTo: manager.id,
        requestedBy: "Building Manager",
        cost: 2800,
        createdAt: new Date("2025-05-19T08:45:00Z"),
      },
      {
        propertyId: p1.id,
        propertyName: p1.name,
        unit: "Lobby",
        title: "Cracked lobby window",
        description:
          "The large window near the main entrance has a visible crack. Needs assessment and replacement.",
        category: "structural",
        priority: "medium",
        status: "open",
        requestedBy: "Front Desk",
        createdAt: new Date("2025-05-18T16:00:00Z"),
      },
      {
        propertyId: p3.id,
        propertyName: p3.name,
        unit: "22B",
        title: "Dishwasher not draining",
        description:
          "Dishwasher fills with water but doesn't drain. Water remains at bottom after cycle completes.",
        category: "appliance",
        priority: "low",
        status: "resolved",
        assignedTo: manager.id,
        requestedBy: "Tom Baker",
        cost: 175,
        createdAt: new Date("2025-05-15T10:00:00Z"),
        resolvedAt: new Date("2025-05-17T14:30:00Z"),
      },
      {
        propertyId: p6.id,
        propertyName: p6.name,
        unit: "Suite 300",
        title: "Pest infestation in break room",
        description:
          "Multiple reports of cockroaches in the 3rd floor break room. Needs immediate treatment.",
        category: "pest",
        priority: "high",
        status: "in-progress",
        requestedBy: "Office Manager",
        cost: 600,
        createdAt: new Date("2025-05-16T11:30:00Z"),
      },
      {
        propertyId: p2.id,
        propertyName: p2.name,
        unit: "10A",
        title: "Water heater replacement",
        description:
          "Water heater is 12 years old and rusting. Needs complete replacement with new energy-efficient unit.",
        category: "plumbing",
        priority: "medium",
        status: "closed",
        assignedTo: manager.id,
        requestedBy: "Property Manager",
        cost: 2200,
        createdAt: new Date("2025-05-10T08:00:00Z"),
        resolvedAt: new Date("2025-05-14T16:00:00Z"),
      },
    ],
  });

  console.log("  ✓ Created 7 maintenance requests");

  // ── Bookings ───────────────────────────────────────────────────────────
  await prisma.booking.create({
    data: {
      propertyId: p2.id,
      propertyName: p2.name,
      amenityId: am1.id,
      amenityName: am1.name,
      userId: tenant1.id,
      userName: tenant1.name,
      date: new Date("2025-05-25"),
      startTime: "14:00",
      endTime: "20:00",
      status: "confirmed",
      guestCount: 50,
      notes: "Birthday party setup needed with tables and chairs",
    },
  });

  await prisma.booking.create({
    data: {
      propertyId: p4.id,
      propertyName: p4.name,
      amenityId: am2.id,
      amenityName: am2.name,
      userId: tenant2.id,
      userName: tenant2.name,
      date: new Date("2025-05-24"),
      startTime: "17:00",
      endTime: "22:00",
      status: "confirmed",
      guestCount: 35,
      notes: "Corporate networking event",
    },
  });

  console.log("  ✓ Created 2 bookings");

  // ── Notifications ──────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "Maintenance Emergency",
        message: "Elevator #3 at Metro Lofts is out of service. Emergency repair team dispatched.",
        type: "error",
        read: false,
        createdAt: new Date("2025-05-20T08:45:00Z"),
      },
      {
        userId: admin.id,
        title: "Booking Confirmed",
        message: "Clubhouse booking for Emily Davis on May 25 has been confirmed.",
        type: "success",
        read: false,
        createdAt: new Date("2025-05-20T07:30:00Z"),
      },
      {
        userId: admin.id,
        title: "Payment Received",
        message: "Monthly rent payment of $3,200 received for Skyline Towers unit 12A.",
        type: "success",
        read: true,
        createdAt: new Date("2025-05-19T15:20:00Z"),
      },
      {
        userId: admin.id,
        title: "Lease Expiring Soon",
        message: "5 leases at Greenwood Gardens will expire in the next 30 days. Review renewals.",
        type: "warning",
        read: false,
        createdAt: new Date("2025-05-19T10:00:00Z"),
      },
      {
        userId: admin.id,
        title: "Maintenance Completed",
        message: "Dishwasher repair completed at Greenwood Gardens unit 22B. Cost: $175.",
        type: "info",
        read: true,
        createdAt: new Date("2025-05-17T14:30:00Z"),
      },
      {
        userId: admin.id,
        title: "New Property Listed",
        message: "Palm Springs Villas has been listed on the marketplace.",
        type: "info",
        read: true,
        createdAt: new Date("2025-05-16T11:20:00Z"),
      },
    ],
  });

  console.log("  ✓ Created 6 notifications");

  // ── Activity Logs ─────────────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      {
        userId: tenant1.id,
        userName: tenant1.name,
        userAvatar: tenant1.image,
        action: "booked",
        target: "Clubhouse & Event Space",
        type: "booking",
        createdAt: new Date("2025-05-20T09:30:00Z"),
      },
      {
        userId: tenant2.id,
        userName: tenant2.name,
        userAvatar: tenant2.image,
        action: "submitted maintenance request for",
        target: "Skyline Towers - Unit 12A",
        type: "maintenance",
        createdAt: new Date("2025-05-20T09:15:00Z"),
      },
      {
        userId: tenant3.id,
        userName: tenant3.name,
        userAvatar: tenant3.image,
        action: "reported AC issue at",
        target: "Harbor View Complex - Unit 5C",
        type: "maintenance",
        createdAt: new Date("2025-05-19T14:30:00Z"),
      },
      {
        userId: manager.id,
        userName: manager.name,
        userAvatar: manager.image,
        action: "started repair on",
        target: "Metro Lofts - Elevator #3",
        type: "maintenance",
        createdAt: new Date("2025-05-19T11:00:00Z"),
      },
      {
        userId: tenant2.id,
        userName: tenant2.name,
        userAvatar: tenant2.image,
        action: "paid rent for",
        target: "Greenwood Gardens - Unit 22B",
        type: "payment",
        createdAt: new Date("2025-05-19T10:15:00Z"),
      },
      {
        userId: admin.id,
        userName: admin.name,
        userAvatar: admin.image,
        action: "added new property",
        target: "Palm Springs Villas",
        type: "property",
        createdAt: new Date("2025-05-16T11:20:00Z"),
      },
    ],
  });

  console.log("  ✓ Created 6 activity logs");
  console.log("\n✅ Seed complete! You can now log in with:");
  console.log("   Admin:  alex@propertypro.com / password123");
  console.log("   Manager: michael@propertypro.com / password123");
  console.log("   Tenant:  emily@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });