"use client";

import { useEffect, useState } from "react";
import { UserPlus, Search, Shield, CheckCircle2, XCircle, Mail, Building2, Wrench } from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Department = { id: string; name: string };
type Staff = {
  id: string;
  name: string;
  email: string;
  isActive?: boolean;
  departmentId?: string;
  department?: { name: string };
  role?: string;
  _count?: { assignments: number };
};

export function StaffManager({ kind }: { kind: "workers" | "users" }) {
  const [items, setItems] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  async function load() {
    try {
      const [staff, depts] = await Promise.all([
        api<Staff[] | { items: Staff[] }>(`/api/${kind}`),
        api<Department[]>("/api/departments")
      ]);
      setItems(Array.isArray(staff) ? staff : staff.items);
      setDepartments(depts);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, [kind]);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/${kind}`, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form))
      });
      (e.target as HTMLFormElement).reset();
      setShowAddForm(false);
      setSuccess("Account created successfully.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item: Staff) {
    try {
      await api(`/api/${kind}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive })
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const filteredItems = items.filter(
    item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      (item.department?.name && item.department.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${kind === "workers" ? "field workers" : "administrators"} by name, email or department...`}
            style={{ paddingLeft: "2.75rem" }}
            className="w-full rounded-xl border border-[#EDF2F7] bg-white py-2 pl-11 pr-4 text-xs font-medium text-slate-800 shadow-card placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0A1120] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#162238]"
        >
          <UserPlus size={14} />
          <span>{showAddForm ? "Close Form" : `Add New ${kind === "workers" ? "Worker" : "Admin"}`}</span>
        </button>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-100 bg-[#EDFAF1] p-3 text-xs font-semibold text-emerald-800">
          {success}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Creation Drawer/Card */}
      {showAddForm && (
        <div className="rounded-2xl border border-[#EDF2F7] bg-white p-6 shadow-card transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading text-base font-bold text-[#0F1A2C]">
                Create New {kind === "workers" ? "Field Worker" : "Department Administrator"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Grant staff access and link them to their municipal department
              </p>
            </div>
          </div>

          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={create}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                minLength={2}
                placeholder="e.g. Rahul Sharma"
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                Official Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. staff@techflow.gov"
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
                Temporary Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={12}
                placeholder="Minimum 12 characters"
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label htmlFor="departmentId" className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Department
              </label>
              <div className="relative">
                <select
                  id="departmentId"
                  name="departmentId"
                  required
                  className="w-full appearance-none rounded-xl border border-slate-200/90 bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-[#0F1A2C] shadow-sm hover:bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-2.5 text-[10px] text-slate-400">▼</span>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number (optional)
              </label>
              <Input
                id="phone"
                name="phone"
                placeholder="e.g. +91 98765 43210"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex items-end">
              <Button
                disabled={busy}
                type="submit"
                className="w-full rounded-xl bg-[#1A6BFF] text-white hover:bg-[#1559D6]"
              >
                {busy ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts Table Card */}
      <div className="overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#EDF2F7] bg-slate-50/50">
                {["Personnel", "Email", "Department", kind === "workers" ? "Active Tasks" : "Role", "Status", "Actions"].map(
                  h => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {filteredItems.map(item => {
                const initials = item.name
                  .split(" ")
                  .map(p => p[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const isActive = item.isActive !== false;

                return (
                  <tr key={item.id} className="transition-colors hover:bg-[#F8FAFD]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs shadow-sm">
                          {initials}
                        </div>
                        <span className="font-bold text-xs text-[#0F1A2C]">{item.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-slate-500">
                      {item.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        <Building2 size={12} className="text-slate-400" />
                        {item.department?.name || "Global / Unassigned"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-bold text-slate-700">
                      {kind === "workers" ? (
                        <span className="flex items-center gap-1.5">
                          <Wrench size={13} className="text-blue-600" />
                          <span>{item._count?.assignments || 0} active</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Shield size={13} className="text-blue-600" />
                          <span>{item.role || "Admin"}</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isActive
                            ? "bg-[#EDFAF1] text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggle(item)}
                        className={`rounded-xl border px-3 py-1 text-xs font-semibold shadow-sm transition ${
                          isActive
                            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!filteredItems.length && (
          <div className="py-12 text-center text-xs text-slate-400">
            No accounts found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
