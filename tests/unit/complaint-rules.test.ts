import { describe, expect, it } from "vitest";
import { ComplaintStatus, Role } from "@prisma/client";
import { assertTransition, haversineMetres } from "@/services/complaint.service";
import { categorySchema, categoryUpdateSchema, complaintSchema, registerSchema } from "@/lib/validations";

describe("complaint workflow", () => {
  it("permits an administrator to review a submitted complaint", () => expect(() => assertTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, Role.DEPARTMENT_ADMIN)).not.toThrow());
  it("prevents citizens from changing administrative statuses", () => expect(() => assertTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, Role.CITIZEN)).toThrow());
  it("prevents workers from resolving an unstarted assignment", () => expect(() => assertTransition(ComplaintStatus.ASSIGNED, ComplaintStatus.RESOLVED, Role.FIELD_WORKER)).toThrow());
  it("allows citizen verification only from resolved", () => { expect(() => assertTransition(ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED, Role.CITIZEN)).not.toThrow(); expect(() => assertTransition(ComplaintStatus.IN_PROGRESS, ComplaintStatus.CLOSED, Role.CITIZEN)).toThrow(); });
  it("rejects role crossover", () => { expect(() => assertTransition(ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED, Role.SUPER_ADMIN)).toThrow(); expect(() => assertTransition(ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, Role.CITIZEN)).toThrow(); });
});
describe("location matching", () => {
  it("calculates zero distance for identical points", () => expect(haversineMetres({latitude:12.97,longitude:77.59},{latitude:12.97,longitude:77.59})).toBe(0));
  it("distinguishes points inside and outside 100 metres", () => { const origin={latitude:12.9716,longitude:77.5946}; expect(haversineMetres(origin,{latitude:12.9719,longitude:77.5946})).toBeLessThan(100); expect(haversineMetres(origin,{latitude:12.973,longitude:77.5946})).toBeGreaterThan(100); });
});
describe("request validation", () => {
  it("requires a strong registration password", () => expect(registerSchema.safeParse({name:"Test User",email:"user@example.com",password:"short"}).success).toBe(false));
  it("rejects invalid complaint coordinates", () => expect(complaintSchema.safeParse({title:"Broken streetlight",description:"The streetlight is out on the main road.",categoryId:"43baf795-0260-4bc8-b4e8-f4dc4a8164ff",address:"Main road junction",latitude:120,longitude:77,images:[]}).success).toBe(false));
  it("validates valid category creation input", () => {
    const valid = categorySchema.safeParse({
      name: "Pothole on Main Road",
      slug: "pothole-on-main-road",
      departmentId: "43baf795-0260-4bc8-b4e8-f4dc4a8164ff",
      isActive: true
    });
    expect(valid.success).toBe(true);
  });
  it("rejects category creation with invalid department UUID or slug", () => {
    expect(categorySchema.safeParse({ name: "Roads", departmentId: "invalid-uuid" }).success).toBe(false);
    expect(categorySchema.safeParse({ name: "R", departmentId: "43baf795-0260-4bc8-b4e8-f4dc4a8164ff" }).success).toBe(false);
    expect(categorySchema.safeParse({ name: "Roads", slug: "INVALID SLUG!", departmentId: "43baf795-0260-4bc8-b4e8-f4dc4a8164ff" }).success).toBe(false);
  });
  it("accepts valid category update partial payloads", () => {
    expect(categoryUpdateSchema.safeParse({ isActive: false }).success).toBe(true);
    expect(categoryUpdateSchema.safeParse({ name: "Updated Category Name" }).success).toBe(true);
  });
});
