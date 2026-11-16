import { Role, Priority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, ok } from "@/lib/http";
import { requireUser } from "@/lib/permissions";

const showcaseDepartments = [
  {
    name: "Roads Department",
    slug: "roads",
    description: "Maintenance, pothole repairs, and roadway safety operations.",
    categories: [
      { name: "Damaged Roads & Potholes", slug: "damaged-roads-and-potholes" },
      { name: "Pothole on Main Road", slug: "pothole-on-main-road" },
      { name: "Road Repair & Resurfacing", slug: "road-repair-and-resurfacing" }
    ]
  },
  {
    name: "Water Supply Department",
    slug: "water",
    description: "Municipal water distribution, pipeline maintenance, and water quality control.",
    categories: [
      { name: "Water Leakage", slug: "water-leakage" },
      { name: "Pipeline Burst", slug: "pipeline-burst" },
      { name: "Low Water Pressure", slug: "low-water-pressure" },
      { name: "Contaminated Water Supply", slug: "contaminated-water-supply" }
    ]
  },
  {
    name: "Sanitation Department",
    slug: "sanitation",
    description: "Solid waste management, garbage accumulation clearing, and drainage maintenance.",
    categories: [
      { name: "Garbage Accumulation", slug: "garbage-accumulation" },
      { name: "Drainage Problems & Cleaning", slug: "drainage-problems-and-cleaning" },
      { name: "Sewage Overflow", slug: "sewage-overflow" },
      { name: "Public Bin Overflow", slug: "public-bin-overflow" }
    ]
  },
  {
    name: "Electrical Department",
    slug: "electrical",
    description: "Streetlight maintenance, grid reliability, and public electrical hazard mitigation.",
    categories: [
      { name: "Broken Streetlights", slug: "broken-streetlights" },
      { name: "Power Outage", slug: "power-outage" },
      { name: "Exposed Electric Cables", slug: "exposed-electric-cables" },
      { name: "Faulty Transformer", slug: "faulty-transformer" }
    ]
  },
  {
    name: "Public Works Department",
    slug: "public-works",
    description: "Civic infrastructure, footpaths, bridges, boundary walls, and public structures.",
    categories: [
      { name: "Damaged Public Infrastructure", slug: "damaged-public-infrastructure" },
      { name: "Unsafe Public Areas", slug: "unsafe-public-areas" },
      { name: "Broken Footpath & Sidewalk", slug: "broken-footpath-and-sidewalk" },
      { name: "Damaged Signboard / Guardrail", slug: "damaged-signboard-guardrail" }
    ]
  }
];

export async function POST() {
  try {
    const actor = await requireUser([Role.SUPER_ADMIN]);

    let createdCategoriesCount = 0;
    let createdDepartmentsCount = 0;

    await prisma.$transaction(async tx => {
      for (const dept of showcaseDepartments) {
        const department = await tx.department.upsert({
          where: { slug: dept.slug },
          update: { name: dept.name, description: dept.description, isActive: true },
          create: { name: dept.name, slug: dept.slug, description: dept.description, isActive: true }
        });
        createdDepartmentsCount++;

        for (const cat of dept.categories) {
          await tx.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, departmentId: department.id, isActive: true },
            create: { name: cat.name, slug: cat.slug, departmentId: department.id, isActive: true }
          });
          createdCategoriesCount++;
        }
      }

      // Ensure global baseline SLA policies are also ready
      for (const [priority, hours] of Object.entries({ CRITICAL: 24, HIGH: 48, MEDIUM: 120, LOW: 168 })) {
        const existing = await tx.slaPolicy.findFirst({ where: { departmentId: null, priority: priority as Priority } });
        if (!existing) {
          await tx.slaPolicy.create({ data: { priority: priority as Priority, hours } });
        }
      }

      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "CREATE",
          entityType: "system",
          entityId: actor.id,
          details: { message: "Seeded all showcase categories & departments", departments: createdDepartmentsCount, categories: createdCategoriesCount }
        }
      });
    });

    return ok({
      success: true,
      message: `Successfully initialized ${createdDepartmentsCount} departments and ${createdCategoriesCount} issue categories.`
    });
  } catch (error) {
    return errorResponse(error);
  }
}
