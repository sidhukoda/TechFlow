import { NewComplaintForm } from "@/components/complaints/new-complaint-form";

export default function NewComplaint() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          Report an Infrastructure Issue
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit photographs, pin the exact location, and dispatch municipal repair teams with immediate tracking
        </p>
      </div>

      <NewComplaintForm />
    </div>
  );
}
