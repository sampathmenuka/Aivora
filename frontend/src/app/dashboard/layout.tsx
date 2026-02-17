import { ReactNode } from "react";

// Dashboard pages render their own DashboardLayout (with sidebar + topbar),
// so we bypass the root Navbar entirely by defining a blank nested layout.
export default function DashboardRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
