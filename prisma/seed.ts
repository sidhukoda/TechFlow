import { PrismaClient, Role, Priority } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const departments = [
  { name: "Roads Department", slug: "roads", categories: ["Damaged Roads & Potholes"] },
  { name: "Water Supply Department", slug: "water", categories: ["Water Leakage"] },
  { name: "Sanitation Department", slug: "sanitation", categories: ["Garbage Accumulation", "Drainage Problems"] },
  { name: "Electrical Department", slug: "electrical", categories: ["Broken Streetlights"] },
  { name: "Public Works Department", slug: "public-works", categories: ["Damaged Public Infrastructure", "Unsafe Public Areas"] }
];

async function main() {
  const deptMap: Record<string, string> = {};

  for (const item of departments) {
    const department = await prisma.department.upsert({
      where: { slug: item.slug },
      update: { name: item.name, isActive: true },
      create: { name: item.name, slug: item.slug }
    });
    deptMap[item.slug] = department.id;

    for (const name of item.categories) {
      const slug = name.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
      await prisma.category.upsert({
        where: { slug },
        update: { name, departmentId: department.id },
        create: { name, slug, departmentId: department.id }
      });
    }
  }

  for (const [priority, hours] of Object.entries({ CRITICAL: 24, HIGH: 48, MEDIUM: 120, LOW: 168 })) {
    const existing = await prisma.slaPolicy.findFirst({ where: { departmentId: null, priority: priority as Priority } });
    if (!existing) await prisma.slaPolicy.create({ data: { priority: priority as Priority, hours } });
  }

  const password = process.env.SEED_DEMO_PASSWORD || "DemoPassword123!";
  const hashValue = await hash(password, 12);

  const accounts = [
    { email: "citizen@techflow.example", name: "Citizen", role: Role.CITIZEN, departmentId: null },
    { email: "superadmin@techflow.example", name: "Super Admin", role: Role.SUPER_ADMIN, departmentId: null },
    // Roads
    { email: "roadsadmin@techflow.example", name: "Roads Admin", role: Role.DEPARTMENT_ADMIN, departmentId: deptMap["roads"] },
    { email: "worker@techflow.example", name: "Field Worker", role: Role.FIELD_WORKER, departmentId: deptMap["roads"] },
    // Water
    { email: "wateradmin@techflow.example", name: "Water Admin", role: Role.DEPARTMENT_ADMIN, departmentId: deptMap["water"] },
    { email: "waterworker@techflow.example", name: "Water Crew Worker", role: Role.FIELD_WORKER, departmentId: deptMap["water"] },
    // Sanitation
    { email: "sanitationadmin@techflow.example", name: "Sanitation Admin", role: Role.DEPARTMENT_ADMIN, departmentId: deptMap["sanitation"] },
    { email: "sanitationworker@techflow.example", name: "Sanitation Crew Worker", role: Role.FIELD_WORKER, departmentId: deptMap["sanitation"] },
    // Electrical
    { email: "electricaladmin@techflow.example", name: "Electrical Admin", role: Role.DEPARTMENT_ADMIN, departmentId: deptMap["electrical"] },
    { email: "electricalworker@techflow.example", name: "Electrical Crew Worker", role: Role.FIELD_WORKER, departmentId: deptMap["electrical"] },
    // Public Works
    { email: "pwdadmin@techflow.example", name: "Public Works Admin", role: Role.DEPARTMENT_ADMIN, departmentId: deptMap["public-works"] },
    { email: "pwdworker@techflow.example", name: "Public Works Worker", role: Role.FIELD_WORKER, departmentId: deptMap["public-works"] }
  ];

  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        role: account.role,
        departmentId: account.departmentId,
        isActive: true
      },
      create: {
        ...account,
        passwordHash: hashValue,
        isActive: true
      }
    });
  }

  console.log("TechFlow seed complete. Standard users and staff created across all departments.");
}

main().finally(() => prisma.$disconnect());
