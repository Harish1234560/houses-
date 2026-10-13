import { PublicLayout } from '@/components/shared/public-layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
