"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";

export default function PurchasesPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => (await apiClient.getPurchases()).data,
  });

  const downloadMutation = useMutation({
    mutationFn: async ({ productId, title }: { productId: number; title: string }) => {
      const { data: downloadLink } = await apiClient.getDownloadLink(productId);
      const response = await apiClient.downloadFromLink(downloadLink);
      const blobUrl = window.URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `${title}.bin`;
      anchor.click();
      window.URL.revokeObjectURL(blobUrl);
    },
  });

  const TYPE_ICON: Record<string, string> = {
    EBOOK: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    COURSE: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
    DIGITAL_FILE: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  };

  return (
    <ProtectedRoute>
      <main className="container-page max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Purchases</h1>
            <p className="text-muted-foreground">{data?.length ?? 0} purchased item{(data?.length ?? 0) !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => refetch()} className="btn-secondary btn btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <p>No purchases yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {data?.map((item) => (
            <div key={item.productId} className="card flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TYPE_ICON[item.productType] ?? TYPE_ICON.DIGITAL_FILE} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.title}</p>
                <span className="badge-blue text-xs">{item.productType}</span>
              </div>
              <button
                className="btn-primary btn btn-sm shrink-0"
                onClick={() => downloadMutation.mutate({ productId: item.productId, title: item.title })}
                disabled={downloadMutation.isPending}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>
      </main>
    </ProtectedRoute>
  );
}

