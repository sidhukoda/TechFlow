import { NotificationList } from "@/components/shared/notification-list";

export default function CitizenNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F1A2C] sm:text-3xl">
          Notifications & Alerts
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time updates regarding your submitted complaints and municipal resolution notices
        </p>
      </div>

      <NotificationList />
    </div>
  );
}
