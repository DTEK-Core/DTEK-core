import { PageSkeleton } from '@/components/shared/loading/page-skeleton';
import '@/app/objects.css';

export default function ObjectsLoading() {
  return <PageSkeleton variant="objects" titleWidth={130} subtitleWidth={360} />;
}
