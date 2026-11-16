import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(255).transform(v => v.toLowerCase().trim()),
  password: z.string().min(12).max(128)
});

export const complaintSchema = z.object({
  title: z.string().trim().min(8).max(160),
  description: z.string().trim().min(20).max(5000),
  categoryId: z.string().uuid(),
  address: z.string().trim().min(5).max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z
    .array(
      z.object({
        publicId: z.string().min(1),
        secureUrl: z.string().min(1)
      })
    )
    .max(5)
    .default([])
});

export const complaintEditSchema = complaintSchema
  .pick({ title: true, description: true, address: true, latitude: true, longitude: true })
  .partial();

export const assignmentSchema = z.object({
  workerId: z.string().min(1),
  remarks: z.string().trim().max(2000).optional()
});

export const statusSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "REJECTED",
    "REOPENED"
  ]),
  remarks: z.string().trim().max(2000).optional()
});

export const prioritySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional()
});

export const departmentSchema = z.object({
  name: z.string().trim().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional()
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).optional(),
  departmentId: z.string().uuid(),
  isActive: z.boolean().optional()
});

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).optional(),
  departmentId: z.string().uuid().optional(),
  isActive: z.boolean().optional()
});

export const staffSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().transform(v => v.toLowerCase().trim()),
  password: z.string().min(12),
  departmentId: z.string().uuid(),
  phone: z.string().max(30).optional()
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).nullable().optional()
});
