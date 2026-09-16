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

// e.g. in a shared utils file
export function tomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

// Strips everything except digits, preserving a leading "+" for +63 format
export function sanitizePhoneInput(raw: string): string {
  const hasPlus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  return (hasPlus ? "+" : "") + digits;
}

// Accepts 09XXXXXXXXX (11 digits) or +639XXXXXXXX (PH mobile formats)
export function isValidPHPhone(value: string): boolean {
  return /^09\d{9}$/.test(value) || /^\+639\d{9}$/.test(value);
}