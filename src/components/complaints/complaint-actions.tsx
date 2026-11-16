"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Upload } from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";

type Worker = {
  id: string;
  name: string;
  isActive: boolean;
  departmentId?: string | null;
  department?: { name: string } | null;
  _count: { assignments: number };
};

export function ComplaintActions({
  id,
  role,
  status,
  priority,
  feedback,
  resolutionApprovedAt,
  departmentId
}: {
  id: string;
  resolutionApprovedAt: boolean;
  role: "citizen" | "admin" | "worker";
  status: string;
  priority: string;
  departmentId: string;
  feedback: { rating: number; comment: string | null } | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [remarks, setRemarks] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerId, setWorkerId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(priority);
  const [rating, setRating] = useState(feedback?.rating || 5);
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (role === "admin") {
      api<Worker[]>("/api/workers")
        .then(setWorkers)
        .catch(() => {});
    }
  }, [role]);

  async function run(url: string, method = "POST", data: unknown = { remarks }) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(url, { method, body: JSON.stringify(data) });
      setMessage("Action completed successfully");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function upload(kind: "PROGRESS" | "COMPLETION") {
    if (!photo) return;
    setBusy(true);
    setError("");
    try {
      const ext = photo.name.split(".").pop()?.toLowerCase() || "";
      const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext) || photo.type.startsWith("image/");
      if (!isImage) {
        throw new Error("Choose a JPG, PNG or WebP image");
      }
      if (photo.size > 10 * 1024 * 1024) {
        throw new Error("Image must be under 10 MB");
      }

      const form = new FormData();
      form.append("file", photo);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const item = data.data || data;
      const publicId = item.publicId || item.public_id;
      const secureUrl = item.secureUrl || item.secure_url;

      await api(`/api/complaints/${id}/images`, {
        method: "POST",
        body: JSON.stringify({ kind, publicId, secureUrl })
      });
      setMessage("Photo uploaded successfully");
      setPhoto(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* ADMIN ACTIONS */}
      {role === "admin" && (
        <>
          {status === "SUBMITTED" && (
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => run(`/api/complaints/${id}/status`, "PATCH", { status: "UNDER_REVIEW", remarks })}
            >
              Start Review
            </Button>
          )}

          {["SUBMITTED", "UNDER_REVIEW"].includes(status) && (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              disabled={busy}
              onClick={() => run(`/api/complaints/${id}/status`, "PATCH", { status: "REJECTED", remarks })}
            >
              Reject Report
            </Button>
          )}

          <div>
            <label htmlFor="priority">Update Priority</label>
            <select
              id="priority"
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full"
            >
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full text-xs"
              disabled={busy || selectedPriority === priority}
              onClick={() => run(`/api/complaints/${id}/priority`, "PATCH", { priority: selectedPriority })}
            >
              Save Priority
            </Button>
          </div>

          {["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "REOPENED", "IN_PROGRESS"].includes(status) && (
            <div>
              <label htmlFor="worker">Assign Field Worker</label>
              {(() => {
                const deptWorkers = workers.filter(
                  w => w.isActive && (!departmentId || w.departmentId === departmentId)
                );
                const displayWorkers = deptWorkers.length > 0 ? deptWorkers : workers.filter(w => w.isActive);
                return (
                  <select
                    id="worker"
                    value={workerId}
                    onChange={e => setWorkerId(e.target.value)}
                    className="w-full"
                  >
                    <option value="">Select Field Worker</option>
                    {displayWorkers.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} {w.department?.name ? `(${w.department.name})` : ""} — {w._count?.assignments ?? 0} active tasks
                      </option>
                    ))}
                  </select>
                );
              })()}
              <Button
                className="mt-2 w-full"
                disabled={busy || !workerId}
                onClick={() => run(`/api/complaints/${id}/assign`, "POST", { workerId, remarks })}
              >
                Assign Worker
              </Button>
            </div>
          )}

          {status === "REOPENED" && (
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => run(`/api/complaints/${id}/status`, "PATCH", { status: "UNDER_REVIEW", remarks })}
            >
              Return to Review
            </Button>
          )}
        </>
      )}

      {/* FIELD WORKER ACTIONS */}
      {role === "worker" && (
        <>
          {status === "ASSIGNED" && (
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => run(`/api/complaints/${id}/status`, "PATCH", { status: "IN_PROGRESS", remarks })}
            >
              Accept & Start Work
            </Button>
          )}

          {status === "IN_PROGRESS" && (
            <>
              <div>
                <label htmlFor="evidence">Upload Work Photo</label>
                <input
                  id="evidence"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={e => setPhoto(e.target.files?.[0] || null)}
                  className="block w-full text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" disabled={busy || !photo} onClick={() => upload("PROGRESS")}>
                  <Upload size={14} /> Progress Photo
                </Button>
                <Button variant="outline" size="sm" className="flex-1" disabled={busy || !photo} onClick={() => upload("COMPLETION")}>
                  <Upload size={14} /> Completion Photo
                </Button>
              </div>

              <Button className="w-full" disabled={busy} onClick={() => run(`/api/complaints/${id}/resolve`)}>
                Submit Resolution for Review
              </Button>
            </>
          )}
        </>
      )}

      {/* CITIZEN ACTIONS */}
      {role === "citizen" && (
        <>
          {status === "RESOLVED" && (
            <>
              {!resolutionApprovedAt && (
                <p className="text-xs text-slate-500">Awaiting department administrator evidence verification.</p>
              )}
              <Button
                className="w-full"
                disabled={busy || !resolutionApprovedAt}
                onClick={() => run(`/api/complaints/${id}/verify`)}
              >
                <Check size={16} /> Verify & Close Report
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                disabled={busy || !remarks.trim()}
                onClick={() => run(`/api/complaints/${id}/reopen`)}
              >
                Reject Resolution
              </Button>
              <p className="text-[11px] text-slate-500">Provide remarks below before rejecting resolution.</p>
            </>
          )}

          {status === "CLOSED" && (
            <div>
              <label htmlFor="rating">Rate the Resolution Quality</label>
              <select
                id="rating"
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="w-full"
              >
                {[5, 4, 3, 2, 1].map(n => (
                  <option value={n} key={n}>
                    {n} Star{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <Button
                className="mt-2 w-full"
                disabled={busy}
                onClick={() => run(`/api/complaints/${id}/feedback`, "POST", { rating, comment: remarks })}
              >
                {feedback ? "Update Feedback" : "Submit Rating"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* REMARKS FIELD */}
      {((role === "admin" && ["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "REOPENED"].includes(status)) ||
        (role === "worker" && ["ASSIGNED", "IN_PROGRESS"].includes(status)) ||
        (role === "citizen" && ["RESOLVED", "CLOSED"].includes(status))) && (
        <div>
          <label htmlFor="remarks">Action Remarks</label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Add context or notes for this action"
            className="text-xs"
          />
        </div>
      )}

      {busy && (
        <p className="flex items-center gap-2 text-xs font-medium text-blue-600">
          <Loader2 size={14} className="animate-spin" /> Saving action...
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
          {message}
        </p>
      )}
    </div>
  );
}
