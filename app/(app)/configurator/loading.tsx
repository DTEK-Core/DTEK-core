import { PageSkeleton } from '@/components/shared/loading/page-skeleton';
import '@/app/configurator.css';

export default function ConfiguratorLoading() {
  return <PageSkeleton variant="configurator" titleWidth={190} subtitleWidth={360} />;
}
