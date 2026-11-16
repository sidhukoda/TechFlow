import { ProfileForm } from "@/components/shared/profile-form";

export default function CitizenProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          Account Profile & Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your contact credentials and civic account details
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
