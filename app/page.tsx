import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { DashboardLoading } from "./dashboard-loading";

export default function Home() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
