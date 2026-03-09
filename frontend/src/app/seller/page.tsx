"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect legacy /seller URL to the new seller dashboard
export default function SellerRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/seller");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted-foreground text-sm">Redirecting to seller dashboard…</p>
    </div>
  );
}

