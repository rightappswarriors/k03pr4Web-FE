export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

export const discountedPrice = (price: number, discountPercent: number) =>
  price - price * (discountPercent / 100);

export const deliverySteps = [
  "Preparing Item",
  "Waiting for Rider Assign",
  "Rider Assigned",
  "On Delivery",
  "Delivered",
];