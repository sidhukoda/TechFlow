"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  FileImage,
  LocateFixed,
  Loader2,
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Wrench,
  Droplets,
  Trash2,
  Lightbulb,
  Building2,
  Tag,
  MapPin
} from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const MapPicker = dynamic(
  () => import("@/components/maps/map-picker").then(m => m.MapPicker),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-lg bg-slate-100" /> }
);

type Category = {
  id: string;
  name: string;
  slug: string;
  department: { name: string; slug: string };
};

type Duplicate = {
  id: string;
  ticketNumber: string;
  title: string;
  distanceMetres: number;
};

type Uploaded = {
  publicId: string;
  secureUrl: string;
};

const categoryIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  roads: Wrench,
  water: Droplets,
  sanitation: Trash2,
  electrical: Lightbulb,
  "public-works": Building2
};

export function NewComplaintForm() {
  const router = useRouter();

  // Wizard Steps: 1: What happened?, 2: Where is the issue?, 3: Add photos, 4: Review & submit
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);
  const [files, setFiles] = useState<File[]>([]);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Confirmation state
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; ticketNumber?: string } | null>(null);

  useEffect(() => {
    api<Category[]>("/api/categories")
      .then(setCategories)
      .catch(e => setError(e.message));
  }, []);

  // Duplicate detection
  useEffect(() => {
    if (!categoryId) return;
    const t = setTimeout(
      () =>
        api<Duplicate[]>(`/api/complaints/duplicates?categoryId=${categoryId}&latitude=${lat}&longitude=${lng}`)
          .then(setDuplicates)
          .catch(() => {}),
      500
    );
    return () => clearTimeout(t);
  }, [categoryId, lat, lng]);

  function locate() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      p => {
        setLat(p.coords.latitude);
        setLng(p.coords.longitude);
      },
      () => setError("Location access denied. Please click on the map to set the location manually.")
    );
  }

  async function upload(file: File): Promise<Uploaded> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext) || file.type.startsWith("image/");
    if (!isImage) {
      throw new Error(`Unsupported file type: ${file.name}. Please upload JPG, PNG, or WebP.`);
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File ${file.name} exceeds 10 MB limit.`);
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to upload image");
    }

    const item = data.data || data;
    return {
      publicId: item.publicId || item.public_id,
      secureUrl: item.secureUrl || item.secure_url
    };
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !title.trim() || !description.trim() || !address.trim()) {
      setError("Please complete all required fields before submitting.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const images = await Promise.all(files.map(upload));
      const result = await api<{ complaint: { id: string; ticketNumber?: string } }>("/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
          address: address.trim(),
          latitude: lat,
          longitude: lng,
          images
        })
      });
      setSubmittedTicket(result.complaint);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit report");
    } finally {
      setBusy(false);
    }
  }

  const selectedCategory = categories.find(c => c.id === categoryId);

  // Confirmation View
  if (submittedTicket) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center border border-[#E2E8F0]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>
        <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-emerald-700">
          Complaint Submitted
        </span>
        <h2 className="mt-1 text-2xl font-bold text-[#08254F]">Your report has been received</h2>
        <p className="mt-2 text-sm text-slate-600">
          A ticket has been issued and routed to the responsible department for evaluation and worker dispatch.
        </p>

        <div className="my-6 rounded-lg bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Ticket Identifier</p>
          <p className="font-mono text-xl font-bold text-blue-600 mt-1">
            {submittedTicket.ticketNumber || "TF-RECORDED"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Button asChild>
            <Link href={`/citizen/complaints/${submittedTicket.id}`}>View Complaint Timeline</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSubmittedTicket(null);
              setStep(1);
              setTitle("");
              setDescription("");
              setAddress("");
              setFiles([]);
            }}
          >
            Submit Another Report
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4-Step Progress Indicator (Subtle 8px rounding, no pills, clean sentence case) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Progress steps">
        {[
          { num: 1, label: "1. What happened?" },
          { num: 2, label: "2. Where is it?" },
          { num: 3, label: "3. Add photos" },
          { num: 4, label: "4. Review & submit" }
        ].map(s => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                // Allow jumping to steps already visited or validated
                if (s.num === 1) setStep(1);
                if (s.num === 2 && categoryId && title.length >= 8 && description.length >= 20) setStep(2);
                if (s.num === 3 && address.length >= 5) setStep(3);
                if (s.num === 4 && address.length >= 5) setStep(4);
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition ${
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[11px] font-bold ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isDone ? "✓" : s.num}
              </span>
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* STEP 1: What happened? */}
      {step === 1 && (
        <Card className="p-6 border border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#08254F]">What happened?</h2>
          <p className="muted mt-1 text-xs">
            Select the category that best describes the infrastructure issue, then provide a short title and description.
          </p>

          <div className="mt-5 space-y-6">
            <div>
              <label>Select Category</label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(cat => {
                  const isSelected = categoryId === cat.id;
                  const Icon = categoryIconMap[cat.department?.slug] || Tag;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-blue-900" : "text-[#08254F]"}`}>
                          {cat.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{cat.department?.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="issue-title">Issue Title</label>
              <Input
                id="issue-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole on Main Road junction"
                minLength={8}
                maxLength={160}
                required
              />
              <p className="mt-1 text-xs text-slate-500">Provide a brief, specific summary (minimum 8 characters).</p>
            </div>

            <div>
              <label htmlFor="issue-desc">Detailed Description</label>
              <textarea
                id="issue-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what is damaged, how severe the issue is, and how it impacts pedestrians or traffic."
                minLength={20}
                maxLength={5000}
                required
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 20 characters.</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                disabled={!categoryId || title.trim().length < 8 || description.trim().length < 20}
                onClick={() => {
                  setError("");
                  setStep(2);
                }}
              >
                Continue to Location <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Where is the issue? */}
      {step === 2 && (
        <Card className="p-6 border border-[#E2E8F0]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#08254F]">Where is the issue?</h2>
              <p className="muted mt-1 text-xs">
                Pin the location on the map and confirm the street address or nearby landmark.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={locate} className="gap-1.5 text-xs">
              <LocateFixed size={15} /> Use My Location
            </Button>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <MapPicker
                  latitude={lat}
                  longitude={lng}
                  onChange={(latitude, longitude) => {
                    setLat(latitude);
                    setLng(longitude);
                  }}
                />
              </div>
              <p className="mt-2 text-xs font-mono text-slate-500">
                GPS Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>

            <div>
              <label htmlFor="issue-address">Street Address or Landmark</label>
              <Input
                id="issue-address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Opposite Sector 8 Community Center, Main Road"
                minLength={5}
                required
              />
            </div>

            {duplicates.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Similar Reports Nearby
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  Others may have already reported this issue. You can review existing tickets below:
                </p>
                <div className="mt-2.5 space-y-1.5">
                  {duplicates.map(d => (
                    <Link
                      key={d.id}
                      href={`/citizen/nearby/${d.id}`}
                      className="block text-xs font-medium text-blue-700 hover:underline"
                    >
                      {d.ticketNumber}: {d.title} ({d.distanceMetres}m away)
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button
                type="button"
                disabled={address.trim().length < 5}
                onClick={() => {
                  setError("");
                  setStep(3);
                }}
              >
                Continue to Photos <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Add photos */}
      {step === 3 && (
        <Card className="p-6 border border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#08254F]">Add photo evidence</h2>
          <p className="muted mt-1 text-xs">
            Clear photographs help municipal workers evaluate tools and materials needed before visiting the site.
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="photo-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/70 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50/40"
              >
                <Camera size={28} className="text-blue-600" />
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {files.length ? `${files.length} photo(s) selected` : "Click to select or drop photographs"}
                </p>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP up to 10 MB each (up to 5 images)</p>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={e => {
                  const chosen = Array.from(e.target.files || []).slice(0, 5);
                  setFiles(chosen);
                }}
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Selected Files:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileImage size={16} className="text-blue-600 shrink-0" />
                        <span className="truncate font-medium text-slate-800">{file.name}</span>
                        <span className="text-slate-400">({Math.round(file.size / 1024)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiles(cur => cur.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 ml-2"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(4);
                }}
              >
                Review Report <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Review & Submit */}
      {step === 4 && (
        <Card className="p-6 border border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#08254F]">Review and submit</h2>
          <p className="muted mt-1 text-xs">
            Verify the details below before filing your public infrastructure complaint.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Category & Department</span>
                  <p className="text-sm font-semibold text-[#08254F] mt-0.5">
                    {selectedCategory?.name} &middot; {selectedCategory?.department.name}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs text-blue-600 h-7 px-2">
                  Edit
                </Button>
              </div>

              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Issue Title & Description</span>
                  <p className="text-sm font-bold text-[#08254F] mt-0.5">{title}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs text-blue-600 h-7 px-2">
                  Edit
                </Button>
              </div>

              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</span>
                  <p className="text-sm font-semibold text-[#08254F] mt-0.5">{address}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-xs text-blue-600 h-7 px-2">
                  Edit
                </Button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Attached Photographs</span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {files.length > 0 ? `${files.length} photo(s) selected for upload` : "No photos attached"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="text-xs text-blue-600 h-7 px-2">
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button type="button" disabled={busy} onClick={handleFinalSubmit} className="gap-2">
                {busy && <Loader2 size={16} className="animate-spin" />}
                Confirm & Submit Report
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
