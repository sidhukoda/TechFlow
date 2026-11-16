"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Tag,
  Plus,
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Check
} from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export type Category = {
  id: string;
  name: string;
  slug: string;
  departmentId: string;
  isActive: boolean;
  department?: { id: string; name: string; slug: string; isActive?: boolean };
  _count?: { complaints: number };
};

export type Department = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  categories?: Category[];
  _count: { users: number; complaints: number; categories?: number };
};

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<"departments" | "categories">("departments");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters for categories tab
  const [catSearch, setCatSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Department creation state
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptSlug, setNewDeptSlug] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");

  // Category creation state
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDeptId, setNewCatDeptId] = useState("");
  const [newCatActive, setNewCatActive] = useState(true);

  // Editing state
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replaceAll("&", "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function loadData() {
    try {
      setError("");
      const [depts, cats] = await Promise.all([
        api<Department[]>("/api/departments"),
        api<Category[]>("/api/categories?all=true")
      ]);
      setDepartments(depts);
      setCategories(cats);
    } catch (e) {
      setError((e as Error).message || "Failed to load department and category data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Department CRUD
  async function handleCreateDepartment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const slug = newDeptSlug.trim() || slugify(newDeptName);
      await api("/api/departments", {
        method: "POST",
        body: JSON.stringify({
          name: newDeptName.trim(),
          slug,
          description: newDeptDesc.trim() || undefined
        })
      });
      setNewDeptName("");
      setNewDeptSlug("");
      setNewDeptDesc("");
      setSuccess(`Department "${newDeptName.trim()}" created successfully.`);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleDepartment(dept: Department) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(`/api/departments/${dept.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !dept.isActive })
      });
      setSuccess(`Department "${dept.name}" ${!dept.isActive ? "activated" : "deactivated"}.`);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateDepartment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingDept) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(`/api/departments/${editingDept.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingDept.name,
          slug: editingDept.slug,
          description: editingDept.description || undefined,
          isActive: editingDept.isActive
        })
      });
      setSuccess(`Department "${editingDept.name}" updated successfully.`);
      setEditingDept(null);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteDepartment(dept: Department) {
    if (!confirm(`Are you sure you want to remove or deactivate department "${dept.name}"?`)) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await api<{ message?: string; success?: boolean }>(`/api/departments/${dept.id}`, {
        method: "DELETE"
      });
      setSuccess(res.message || `Department "${dept.name}" processed.`);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Category CRUD
  async function handleCreateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newCatName.trim() || !newCatDeptId) {
      setError("Please provide a category name and choose an assigned department.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const slug = newCatSlug.trim() || slugify(newCatName);
      await api("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: newCatName.trim(),
          slug,
          departmentId: newCatDeptId,
          isActive: newCatActive
        })
      });
      const createdName = newCatName.trim();
      setNewCatName("");
      setNewCatSlug("");
      setSuccess(`Working category "${createdName}" added successfully.`);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleCategory(cat: Category) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(`/api/categories/${cat.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !cat.isActive })
      });
      setSuccess(`Category "${cat.name}" is now ${!cat.isActive ? "active" : "inactive"}.`);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingCat) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(`/api/categories/${editingCat.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingCat.name,
          slug: editingCat.slug,
          departmentId: editingCat.departmentId,
          isActive: editingCat.isActive
        })
      });
      setSuccess(`Category "${editingCat.name}" updated successfully.`);
      setEditingCat(null);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCategory(cat: Category) {
    if (!confirm(`Are you sure you want to remove or deactivate category "${cat.name}"?`)) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await api<{ message?: string; success?: boolean; deactivated?: boolean }>(
        `/api/categories/${cat.id}`,
        { method: "DELETE" }
      );
      setSuccess(res.message || `Category "${cat.name}" processed.`);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Seed standard showcase categories
  async function handleSeedShowcaseCategories() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await api<{ message?: string; success?: boolean }>("/api/categories/seed", {
        method: "POST"
      });
      setSuccess(res.message || "All standard showcase departments and issue categories have been initialized!");
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Quick category add from department card
  function quickAddCategoryForDept(deptId: string) {
    setNewCatDeptId(deptId);
    setActiveTab("categories");
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchSearch =
        cat.name.toLowerCase().includes(catSearch.toLowerCase()) ||
        cat.slug.toLowerCase().includes(catSearch.toLowerCase()) ||
        cat.department?.name.toLowerCase().includes(catSearch.toLowerCase());
      const matchDept = !deptFilter || cat.departmentId === deptFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && cat.isActive) ||
        (statusFilter === "inactive" && !cat.isActive);
      return matchSearch && matchDept && matchStatus;
    });
  }, [categories, catSearch, deptFilter, statusFilter]);

  const totalActiveCategories = useMemo(() => categories.filter(c => c.isActive).length, [categories]);
  const totalActiveDepartments = useMemo(() => departments.filter(d => d.isActive).length, [departments]);
  const totalComplaintsTracked = useMemo(
    () => departments.reduce((acc, d) => acc + (d._count?.complaints || 0), 0),
    [departments]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Departments & Issue Categories</h2>
          <p className="muted mt-1">
            Configure public departments and their working category issue types for citizen reporting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={handleSeedShowcaseCategories}
            className="flex items-center gap-2 border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100/70"
          >
            <Sparkles size={16} className="text-blue" />
            Initialize Showcase Categories
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Departments</p>
              <p className="mt-1.5 text-2xl font-bold text-navy">
                {totalActiveDepartments}{" "}
                <span className="text-sm font-normal text-slate-400">/ {departments.length} active</span>
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue">
              <Building2 size={22} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Working Categories</p>
              <p className="mt-1.5 text-2xl font-bold text-navy">
                {totalActiveCategories}{" "}
                <span className="text-sm font-normal text-slate-400">/ {categories.length} active</span>
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Tag size={22} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Reports Mapped</p>
              <p className="mt-1.5 text-2xl font-bold text-navy">{totalComplaintsTracked}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Layers size={22} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Issue Coverage</p>
              <p className="mt-1.5 text-2xl font-bold text-navy">100%</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1">{error}</div>
          <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />
          <div className="flex-1">{success}</div>
          <button type="button" onClick={() => setSuccess("")} className="text-green-500 hover:text-green-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "departments"
              ? "border-blue text-blue"
              : "border-transparent text-slate-500 hover:text-navy"
          }`}
        >
          <Building2 size={17} />
          Departments ({departments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "categories"
              ? "border-blue text-blue"
              : "border-transparent text-slate-500 hover:text-navy"
          }`}
        >
          <Tag size={17} />
          Issue Categories & Working Types ({categories.length})
        </button>
      </div>

      {/* TAB 1: DEPARTMENTS VIEW */}
      {activeTab === "departments" && (
        <div className="space-y-6">
          {/* Add Department Form */}
          <Card className="p-6">
            <div className="flex items-center gap-2 text-navy">
              <Building2 size={20} className="text-blue" />
              <h3 className="panel-heading">Add New Department</h3>
            </div>
            <p className="muted mt-1 text-xs">
              Create a municipal authority team responsible for handling citizen complaints.
            </p>
            <form onSubmit={handleCreateDepartment} className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="dept-name">Department Name</label>
                <Input
                  id="dept-name"
                  value={newDeptName}
                  onChange={e => {
                    setNewDeptName(e.target.value);
                    if (!newDeptSlug || newDeptSlug === slugify(newDeptName)) {
                      setNewDeptSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="e.g. Roads Department"
                  minLength={3}
                  required
                />
              </div>
              <div>
                <label htmlFor="dept-slug">Identifier / Slug</label>
                <Input
                  id="dept-slug"
                  value={newDeptSlug}
                  onChange={e => setNewDeptSlug(e.target.value)}
                  placeholder="e.g. roads"
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>
              <div>
                <label htmlFor="dept-desc">Description</label>
                <Input
                  id="dept-desc"
                  value={newDeptDesc}
                  onChange={e => setNewDeptDesc(e.target.value)}
                  placeholder="Role and service area"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button disabled={busy || !newDeptName.trim()} type="submit" className="gap-2">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create Department
                </Button>
              </div>
            </form>
          </Card>

          {/* Department List with Category Chips */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy">Active & Registered Departments</h3>
              <span className="text-xs text-slate-500">{departments.length} total</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12 text-slate-500">
                <Loader2 size={24} className="animate-spin text-blue" />
                <span className="ml-2 text-sm">Loading departments...</span>
              </div>
            ) : departments.length === 0 ? (
              <Card className="p-8 text-center text-slate-500">
                <Building2 size={36} className="mx-auto text-slate-300" />
                <p className="mt-3 font-semibold text-navy">No departments found</p>
                <p className="mt-1 text-sm">Initialize the showcase categories or add your first department above.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeedShowcaseCategories}
                  className="mt-4"
                  disabled={busy}
                >
                  <Sparkles size={16} className="mr-2 text-blue" /> Initialize Showcase Categories
                </Button>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {departments.map(dept => {
                  const deptCategories = dept.categories || categories.filter(c => c.departmentId === dept.id);
                  return (
                    <Card key={dept.id} className="flex flex-col justify-between p-6">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-navy text-lg">{dept.name}</h4>
                              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                                {dept.slug}
                              </span>
                            </div>
                            {dept.description && (
                              <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{dept.description}</p>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium border ${
                              dept.isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {dept.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {/* Counts Metrics */}
                        <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-slate-100 py-2.5 text-xs text-slate-600">
                          <div>
                            <span className="font-bold text-navy">{dept._count.complaints}</span> complaints
                          </div>
                          <div className="h-3 w-px bg-slate-200" />
                          <div>
                            <span className="font-bold text-navy">{dept._count.users}</span> staff members
                          </div>
                          <div className="h-3 w-px bg-slate-200" />
                          <div>
                            <span className="font-bold text-navy">{deptCategories.length}</span> working categories
                          </div>
                        </div>

                        {/* Category Working Types Badges */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Assigned Issue Working Types:</span>
                            <button
                              type="button"
                              onClick={() => quickAddCategoryForDept(dept.id)}
                              className="text-blue hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Plus size={13} /> Add Type
                            </button>
                          </div>

                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {deptCategories.length === 0 ? (
                              <span className="text-xs italic text-slate-400">
                                No issue categories configured yet.
                              </span>
                            ) : (
                              deptCategories.map(cat => (
                                <span
                                  key={cat.id}
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                                    cat.isActive
                                      ? "border-blue-100 bg-blue-50/70 text-blue-900"
                                      : "border-slate-200 bg-slate-50 text-slate-400 line-through"
                                  }`}
                                  title={`${cat.name} (${cat.slug}) - ${cat.isActive ? "Active" : "Inactive"}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-sm ${
                                      cat.isActive ? "bg-emerald-500" : "bg-slate-400"
                                    }`}
                                  />
                                  <span className="font-medium">{cat.name}</span>
                                  {cat._count?.complaints !== undefined && cat._count.complaints > 0 && (
                                    <span className="rounded-md bg-blue-100 px-1.5 text-[10px] font-bold text-blue-800">
                                      {cat._count.complaints}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCategory(cat)}
                                    title={cat.isActive ? "Deactivate" : "Activate"}
                                    className="ml-1 text-slate-400 hover:text-navy"
                                  >
                                    {cat.isActive ? <X size={12} /> : <Check size={12} />}
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDept(dept)}
                            className="text-xs text-slate-600 hover:text-navy"
                          >
                            <Edit2 size={14} className="mr-1 text-slate-500" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDepartment(dept)}
                            className="text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} className="mr-1" /> Delete
                          </Button>
                        </div>
                        <Button
                          variant={dept.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleDepartment(dept)}
                          className="text-xs"
                        >
                          {dept.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES & WORKING TYPES MANAGEMENT */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Add Category / Working Type Form */}
          <Card className="p-6">
            <div className="flex items-center gap-2 text-navy">
              <Tag size={20} className="text-blue" />
              <h3 className="panel-heading">Add New Working Category</h3>
            </div>
            <p className="muted mt-1 text-xs">
              Add a specific issue type that citizens can choose when filing infrastructure complaints.
            </p>

            <form onSubmit={handleCreateCategory} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="cat-name">Category / Issue Type Name</label>
                <Input
                  id="cat-name"
                  value={newCatName}
                  onChange={e => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug || newCatSlug === slugify(newCatName)) {
                      setNewCatSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="e.g. Pothole on Main Road"
                  minLength={2}
                  required
                />
              </div>

              <div>
                <label htmlFor="cat-dept">Responsible Department</label>
                <select
                  id="cat-dept"
                  value={newCatDeptId}
                  onChange={e => setNewCatDeptId(e.target.value)}
                  required
                  className="w-full"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} {!d.isActive ? "(Inactive)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cat-slug">Unique Slug / Code</label>
                <Input
                  id="cat-slug"
                  value={newCatSlug}
                  onChange={e => setNewCatSlug(e.target.value)}
                  placeholder="e.g. pothole-on-main-road"
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>

              <div className="flex flex-col justify-end">
                <Button disabled={busy || !newCatName.trim() || !newCatDeptId} type="submit" className="gap-2 w-full">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add Category
                </Button>
              </div>
            </form>
          </Card>

          {/* Category Filter & Search Bar */}
          <Card className="p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={catSearch}
                  onChange={e => setCatSearch(e.target.value)}
                  placeholder="Search working categories..."
                  style={{ paddingLeft: "2.75rem" }}
                  className="pl-11"
                />
              </div>

              <div>
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  aria-label="Filter by department"
                  className="w-full"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                  aria-label="Filter by status"
                  className="w-full"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Comprehensive Categories Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr>
                    {["Category / Issue Type", "Slug", "Department", "Complaints", "Status", "Actions"].map(h => (
                      <th key={h} className="px-5 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(cat => (
                    <tr key={cat.id} className="hover:bg-blue-50/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-blue shrink-0" />
                          <span className="font-semibold text-navy">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{cat.slug}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          <Building2 size={13} className="text-slate-500" />
                          {cat.department?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">
                        {cat._count?.complaints ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${
                            cat.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-sm ${
                              cat.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleCategory(cat)}
                            className="text-xs h-8"
                          >
                            {cat.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCat(cat)}
                            className="text-xs h-8 px-2"
                            title="Edit Category"
                          >
                            <Edit2 size={14} className="text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-xs h-8 px-2 text-red-600 hover:bg-red-50"
                            title="Delete or Deactivate"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCategories.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Tag size={32} className="mx-auto text-slate-300" />
                <p className="mt-2 font-semibold text-navy">No categories found matching your filters</p>
                <p className="mt-1 text-xs text-slate-400">Try clearing your search query or reset the filters.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODAL: EDIT DEPARTMENT */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-navy text-lg">Edit Department</h3>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateDepartment} className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-dept-name">Name</label>
                <Input
                  id="edit-dept-name"
                  value={editingDept.name}
                  onChange={e => setEditingDept({ ...editingDept, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-dept-slug">Slug</label>
                <Input
                  id="edit-dept-slug"
                  value={editingDept.slug}
                  onChange={e => setEditingDept({ ...editingDept, slug: e.target.value })}
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-dept-desc">Description</label>
                <Input
                  id="edit-dept-desc"
                  value={editingDept.description || ""}
                  onChange={e => setEditingDept({ ...editingDept, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-dept-active"
                  checked={editingDept.isActive}
                  onChange={e => setEditingDept({ ...editingDept, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue focus:ring-blue-500"
                />
                <label htmlFor="edit-dept-active" className="mb-0 text-sm font-medium text-navy cursor-pointer">
                  Department is active
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingDept(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: EDIT CATEGORY */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-navy text-lg">Edit Working Category</h3>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-cat-name">Category / Issue Type Name</label>
                <Input
                  id="edit-cat-name"
                  value={editingCat.name}
                  onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-cat-dept">Department</label>
                <select
                  id="edit-cat-dept"
                  value={editingCat.departmentId}
                  onChange={e => setEditingCat({ ...editingCat, departmentId: e.target.value })}
                  required
                  className="w-full"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-cat-slug">Slug / Identifier</label>
                <Input
                  id="edit-cat-slug"
                  value={editingCat.slug}
                  onChange={e => setEditingCat({ ...editingCat, slug: e.target.value })}
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-cat-active"
                  checked={editingCat.isActive}
                  onChange={e => setEditingCat({ ...editingCat, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue focus:ring-blue-500"
                />
                <label htmlFor="edit-cat-active" className="mb-0 text-sm font-medium text-navy cursor-pointer">
                  Category is active for citizen reporting
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingCat(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
