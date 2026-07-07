import { PageSkeleton } from '@/components/shared/loading/page-skeleton';

export default function UsersLoading() {
  return <PageSkeleton variant="users" titleWidth={170} subtitleWidth={350} />;
}
