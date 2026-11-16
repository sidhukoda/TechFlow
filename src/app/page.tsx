import { LandingPage } from "@/components/home/landing-page";

export const revalidate = 3600;

export default function Home() {
  return <LandingPage />;
}
