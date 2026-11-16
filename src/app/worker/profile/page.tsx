import { ProfileForm } from "@/components/shared/profile-form";

export default function WorkerProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          Field Engineer Profile
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your field operator profile and emergency contact phone number
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
