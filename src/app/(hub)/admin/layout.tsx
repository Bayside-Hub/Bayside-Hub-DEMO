import { requireStaff } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireStaff();
  return <div className="theme-light min-h-full bg-content-bg">{children}</div>;
}
