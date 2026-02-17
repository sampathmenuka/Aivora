"use client";

import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";

export default function PurchasesPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => (await apiClient.getPurchases()).data,
  });

  const onDownload = async (productId: number, title: string) => {
    const response = await apiClient.download(productId);
    const blobUrl = window.URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `${title}.bin`;
    anchor.click();
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <ProtectedRoute>
      <main className="container-page">
        <h1 className="mb-4 text-2xl font-bold">My Purchases</h1>
        {isLoading && <p>Loading purchases...</p>}

        <div className="space-y-3">
          {data?.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded border border-border p-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.productType}</p>
              </div>
              <button
                className="rounded border border-border px-3 py-1 text-sm"
                onClick={() => onDownload(item.productId, item.title)}
              >
                Download
              </button>
            </div>
          ))}
        </div>

        <button className="mt-4 rounded border border-border px-3 py-1 text-sm" onClick={() => refetch()}>
          Refresh
        </button>
      </main>
    </ProtectedRoute>
  );
}
