import { apiClient } from "./api";

const EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/epub+zip": "epub",
  "video/mp4": "mp4",
  "audio/mpeg": "mp3",
  "image/png": "png",
  "image/jpeg": "jpg",
};

// Fetches a purchased file through the authenticated API and saves it in the browser
export async function downloadPurchase(productId: number, title: string): Promise<void> {
  const { data: downloadLink } = await apiClient.getDownloadLink(productId);
  const response = await apiClient.downloadFromLink(downloadLink);
  const blob = response.data as Blob;

  // Prefer the extension of the server's filename, then fall back to the content type
  const disposition = String(response.headers["content-disposition"] ?? "");
  const serverName = /filename="?([^";]+)"?/i.exec(disposition)?.[1];
  const serverExtension = serverName?.includes(".") ? serverName.split(".").pop() : undefined;
  const extension = serverExtension ?? EXTENSIONS[blob.type] ?? "bin";
  const safeName = title.replace(/[\\/:*?"<>|]+/g, "").trim() || "download";

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeName}.${extension}`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
