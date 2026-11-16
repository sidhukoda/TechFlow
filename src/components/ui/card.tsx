import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#EDF2F7] bg-white shadow-card transition-all",
        className
      )}
      {...props}
    />
  );
}
