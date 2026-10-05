import { BookOpen, FileArchive, LucideIcon, PlayCircle } from "lucide-react";

export type ProductTypeMeta = {
  label: string;
  icon: LucideIcon;
  // Solid colour used for cover art when a product has no thumbnail
  cover: string;
  badge: string;
};

export const PRODUCT_TYPES: Record<string, ProductTypeMeta> = {
  EBOOK: {
    label: "Ebook",
    icon: BookOpen,
    cover: "bg-indigo-600",
    badge: "badge-blue",
  },
  COURSE: {
    label: "Course",
    icon: PlayCircle,
    cover: "bg-rose-500",
    badge: "badge-red",
  },
  DIGITAL_FILE: {
    label: "Digital file",
    icon: FileArchive,
    cover: "bg-emerald-600",
    badge: "badge-green",
  },
};

export function productTypeMeta(type: string | null | undefined): ProductTypeMeta {
  return PRODUCT_TYPES[type ?? ""] ?? PRODUCT_TYPES.DIGITAL_FILE;
}
