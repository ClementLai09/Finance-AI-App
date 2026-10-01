import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { DashboardLoading } from "./dashboard-loading";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
