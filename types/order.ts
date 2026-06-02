export type DeliveryStatus =
  | "preparing_item"
  | "waiting_for_rider_assign"
  | "rider_assigned"
  | "on_delivery"
  | "delivered";

export type Order = {
  id: string;
  orderNumber: string;
  orderType: "delivery" | "pickup";
  status: DeliveryStatus;
  currentStep: number;
  estimatedDeliveryTime: string;
  assignedStore: string;
  assignedRider?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  deliveryAddress: string;
  latitude: number;
  longitude: number;
};