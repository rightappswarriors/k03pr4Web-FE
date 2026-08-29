export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

// Thin wrapper around formatPrice for the many places prices arrive as
// strings or may be missing (e.g. PriceTier.unitPrice, WholesaleProduct.price).
// Single source of truth — no other component should call Intl.NumberFormat directly.
export const formatProductPrice = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "Price not available";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "Price not available";
  return formatPrice(num);
};

export const discountedPrice = (price: number, discountPercent: number) =>
  price - price * (discountPercent / 100);

export const deliverySteps = [
  "Preparing Item",
  "Waiting for Rider Assign",
  "Rider Assigned",
  "On Delivery",
  "Delivered",
];