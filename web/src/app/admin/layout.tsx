export const metadata = {
  title: 'Admin — KidPulse',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-6 py-10 max-[980px]:px-3 max-[980px]:py-6">{children}</div>;
}
