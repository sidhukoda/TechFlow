export const DEMO_DEPARTMENTS = [
  { id: "dept-roads-01", name: "Roads & Highways Department", slug: "roads", isActive: true },
  { id: "dept-water-02", name: "Water Supply & Drainage", slug: "water", isActive: true },
  { id: "dept-sanitation-03", name: "Sanitation & Waste Management", slug: "sanitation", isActive: true },
  { id: "dept-electrical-04", name: "Electrical & Public Lighting", slug: "electrical", isActive: true },
  { id: "dept-pw-05", name: "Public Works Department", slug: "public-works", isActive: true }
];

export const DEMO_CATEGORIES = [
  { id: "cat-01", name: "Damaged Roads & Potholes", slug: "damaged-roads-and-potholes", departmentId: "dept-roads-01" },
  { id: "cat-02", name: "Water Leakage & Pipeline Rupture", slug: "water-leakage", departmentId: "dept-water-02" },
  { id: "cat-03", name: "Garbage & Waste Accumulation", slug: "garbage-accumulation", departmentId: "dept-sanitation-03" },
  { id: "cat-04", name: "Drainage Overflow & Blockage", slug: "drainage-problems", departmentId: "dept-sanitation-03" },
  { id: "cat-05", name: "Broken & Non-Functional Streetlights", slug: "broken-streetlights", departmentId: "dept-electrical-04" },
  { id: "cat-06", name: "Damaged Public Infrastructure & Sidewalks", slug: "damaged-infrastructure", departmentId: "dept-pw-05" }
];

export const DEMO_COMPLAINTS = [
  {
    id: "complaint-001",
    ticketNumber: "TF-2026-00421",
    title: "Pothole on Sector 8 Main Road",
    description: "Deep pothole forming hazardous traffic congestion near the junction. Requires urgent asphalt resurfacing.",
    address: "Sector 8, Main Highway Junction, Phagwara",
    status: "IN_PROGRESS",
    priority: "HIGH",
    latitude: 12.9716,
    longitude: 77.5946,
    createdAt: new Date(Date.now() - 86400000 * 2),
    dueAt: new Date(Date.now() + 86400000 * 1),
    category: { name: "Damaged Roads & Potholes" },
    department: { name: "Roads & Highways Department" },
    images: [
      {
        id: "img-01",
        kind: "COMPLAINT",
        secureUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
      }
    ],
    history: [
      {
        id: "h-01",
        toStatus: "IN_PROGRESS",
        remarks: "Repair crew dispatched with asphalt equipment.",
        createdAt: new Date(Date.now() - 3600000 * 4),
        actor: { name: "Roads Admin", role: "DEPARTMENT_ADMIN" }
      },
      {
        id: "h-02",
        toStatus: "ASSIGNED",
        remarks: "Assigned to Field Worker Vikram Singh.",
        createdAt: new Date(Date.now() - 3600000 * 20),
        actor: { name: "Roads Admin", role: "DEPARTMENT_ADMIN" }
      },
      {
        id: "h-03",
        toStatus: "SUBMITTED",
        remarks: "Report filed by citizen.",
        createdAt: new Date(Date.now() - 86400000 * 2),
        actor: { name: "Citizen", role: "CITIZEN" }
      }
    ],
    assignments: [
      {
        id: "asg-01",
        status: "ACTIVE",
        worker: { id: "worker-01", name: "Vikram Singh" }
      }
    ],
    feedback: null,
    _count: { supports: 14 }
  },
  {
    id: "complaint-002",
    ticketNumber: "TF-2026-00418",
    title: "Broken Streetlight on Lane 4",
    description: "Entire corridor is completely dark at night creating severe pedestrian safety risks.",
    address: "Lane 4, Subhash Nagar, Ward 12",
    status: "ASSIGNED",
    priority: "MEDIUM",
    latitude: 12.978,
    longitude: 77.601,
    createdAt: new Date(Date.now() - 86400000 * 3),
    dueAt: new Date(Date.now() + 86400000 * 2),
    category: { name: "Broken & Non-Functional Streetlights" },
    department: { name: "Electrical & Public Lighting" },
    images: [],
    history: [
      {
        id: "h-11",
        toStatus: "ASSIGNED",
        remarks: "Technician assigned for LED driver replacement.",
        createdAt: new Date(Date.now() - 3600000 * 12),
        actor: { name: "Super Admin", role: "SUPER_ADMIN" }
      }
    ],
    assignments: [
      {
        id: "asg-02",
        status: "ACTIVE",
        worker: { id: "worker-02", name: "Neha Gupta" }
      }
    ],
    feedback: null,
    _count: { supports: 8 }
  },
  {
    id: "complaint-003",
    ticketNumber: "TF-2026-00395",
    title: "Garbage Overflow at Market Complex",
    description: "Public dumpster has not been cleared for 4 days, causing foul odor and blocking walkway.",
    address: "Central Market Complex, Block B",
    status: "RESOLVED",
    priority: "HIGH",
    latitude: 12.965,
    longitude: 77.589,
    createdAt: new Date(Date.now() - 86400000 * 5),
    dueAt: new Date(Date.now() - 86400000 * 3),
    category: { name: "Garbage & Waste Accumulation" },
    department: { name: "Sanitation & Waste Management" },
    images: [],
    history: [
      {
        id: "h-21",
        toStatus: "RESOLVED",
        remarks: "Dumpster cleared and area sanitized.",
        createdAt: new Date(Date.now() - 86400000 * 3),
        actor: { name: "Field Worker", role: "FIELD_WORKER" }
      }
    ],
    assignments: [],
    feedback: { rating: 5, comment: "Prompt resolution, thank you!" },
    _count: { supports: 22 }
  },
  {
    id: "complaint-004",
    ticketNumber: "TF-2026-00380",
    title: "Continuous Drinking Water Pipeline Leak",
    description: "Water pipe cracked under pedestrian sidewalk, gallons of clean water flowing into road drain.",
    address: "Opposite Community Health Center, Sector 5",
    status: "UNDER_REVIEW",
    priority: "CRITICAL",
    latitude: 12.974,
    longitude: 77.592,
    createdAt: new Date(Date.now() - 3600000 * 8),
    dueAt: new Date(Date.now() + 3600000 * 16),
    category: { name: "Water Leakage & Pipeline Rupture" },
    department: { name: "Water Supply & Drainage" },
    images: [],
    history: [],
    assignments: [],
    feedback: null,
    _count: { supports: 31 }
  },
  {
    id: "complaint-005",
    ticketNumber: "TF-2026-00350",
    title: "Damaged Sidewalk Railing near School",
    description: "Metal guardrail broken off concrete base, poses fall risk to school children.",
    address: "Model Town Primary School Road",
    status: "SUBMITTED",
    priority: "LOW",
    latitude: 12.969,
    longitude: 77.598,
    createdAt: new Date(Date.now() - 3600000 * 3),
    dueAt: new Date(Date.now() + 86400000 * 5),
    category: { name: "Damaged Public Infrastructure & Sidewalks" },
    department: { name: "Public Works Department" },
    images: [],
    history: [],
    assignments: [],
    feedback: null,
    _count: { supports: 5 }
  }
];

export const DEMO_OVERVIEW = {
  total: 1248,
  pending: 37,
  overdue: 12,
  averageResolutionHours: 24.5,
  byStatus: {
    SUBMITTED: 18,
    UNDER_REVIEW: 24,
    ASSIGNED: 37,
    IN_PROGRESS: 68,
    RESOLVED: 980,
    CLOSED: 110,
    REJECTED: 11,
    REOPENED: 0
  }
};

export const DEMO_MONTHLY = [
  { month: "2026-01", total: 85, resolved: 78 },
  { month: "2026-02", total: 92, resolved: 88 },
  { month: "2026-03", total: 110, resolved: 104 },
  { month: "2026-04", total: 95, resolved: 90 },
  { month: "2026-05", total: 125, resolved: 118 },
  { month: "2026-06", total: 140, resolved: 132 },
  { month: "2026-07", total: 115, resolved: 110 },
  { month: "2026-08", total: 130, resolved: 124 },
  { month: "2026-09", total: 105, resolved: 98 },
  { month: "2026-10", total: 120, resolved: 114 },
  { month: "2026-11", total: 126, resolved: 112 }
];

export const DEMO_DEPT_STATS = [
  { departmentId: "dept-roads-01", name: "Roads & Highways", total: 420, resolved: 395 },
  { departmentId: "dept-water-02", name: "Water Supply", total: 280, resolved: 260 },
  { departmentId: "dept-sanitation-03", name: "Sanitation", total: 310, resolved: 298 },
  { departmentId: "dept-electrical-04", name: "Electrical Lighting", total: 148, resolved: 135 },
  { departmentId: "dept-pw-05", name: "Public Works", total: 90, resolved: 82 }
];

export const DEMO_CATEGORY_STATS = [
  { categoryId: "cat-01", name: "Damaged Roads", count: 420 },
  { categoryId: "cat-02", name: "Water Leaks", count: 280 },
  { categoryId: "cat-03", name: "Garbage", count: 210 },
  { categoryId: "cat-04", name: "Drainage", count: 100 },
  { categoryId: "cat-05", name: "Streetlights", count: 148 },
  { categoryId: "cat-06", name: "Sidewalks", count: 90 }
];

export const DEMO_WORKER_WORKLOAD = [
  { name: "Vikram Singh (Roads)", active: 4 },
  { name: "Neha Gupta (Electrical)", active: 3 },
  { name: "Amit Verma (Sanitation)", active: 5 },
  { name: "Suresh Kumar (Water)", active: 2 }
];
