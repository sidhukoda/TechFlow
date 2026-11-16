import { ProfileForm } from "@/components/shared/profile-form";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          Administrator Profile
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your administrative profile, contact number, and credentials
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
