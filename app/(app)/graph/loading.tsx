import { PageSkeleton } from '@/components/shared/loading/page-skeleton';
import '@/app/graph.css';

export default function GraphLoading() {
  return <PageSkeleton variant="graph" titleWidth={190} subtitleWidth={360} />;
}
