import { AccountSidebar } from '@/components/features/account/AccountSidebar';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <AccountSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
