export const SUPABASE_MEDIA_BASE_URL =
  "https://khdoeyvmsvszpmmcwzrt.supabase.co/storage/v1/object/public/media";

export const STORE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop";

export const PRODUCT_FALLBACK_IMAGE = "/img/green_logo.png";

export function getMediaImageUrl(
  image?: string | null,
  fallback = STORE_FALLBACK_IMAGE
) {
  if (!image) return fallback;

  if (image.startsWith("http") || image.startsWith("/")) {
    return image;
  }

  return `${SUPABASE_MEDIA_BASE_URL}/${image}`;
}
