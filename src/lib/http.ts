import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/permissions";

export const ok = (data: unknown, status = 200, init?: ResponseInit) =>
  NextResponse.json({ data }, { status, ...init });
export function errorResponse(error: unknown) {
  if (error instanceof AppError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed", issues: error.flatten() }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: "This record already exists" }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  console.error(error);
  return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
}
export async function body<T>(request: Request, schema: { parse: (value: unknown) => T }): Promise<T> {
  let input: unknown;
  try { input = await request.json(); } catch { throw new AppError(400, "Invalid JSON"); }
  return schema.parse(input);
}
