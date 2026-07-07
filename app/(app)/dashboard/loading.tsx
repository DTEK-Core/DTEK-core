import { PageSkeleton } from '@/components/shared/loading/page-skeleton';
import '@/app/dashboard.css';

export default function DashboardLoading() {
  return <PageSkeleton variant="dashboard" titleWidth={230} subtitleWidth={420} />;
}
