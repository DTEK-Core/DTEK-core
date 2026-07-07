import { PageSkeleton } from '@/components/shared/loading/page-skeleton';
import '@/app/risks.css';

export default function RisksLoading() {
  return <PageSkeleton variant="risks" titleWidth={190} subtitleWidth={390} />;
}
