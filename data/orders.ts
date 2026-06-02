import { Order } from "@/types/order";

export const orders: Order[] = [
  {
    id: "o1",
    orderNumber: "ORD-1001",
    orderType: "delivery",
    status: "preparing_item",
    currentStep: 0,
    estimatedDeliveryTime: "35-45 mins",
    assignedStore: "OrangeMart - Cebu Main",
    deliveryAddress: "Poblacion, Cebu City",
    latitude: 10.3001,
    longitude: 123.9001,
  },
  {
    id: "o2",
    orderNumber: "ORD-1002",
    orderType: "delivery",
    status: "rider_assigned",
    currentStep: 2,
    estimatedDeliveryTime: "20-30 mins",
    assignedStore: "BlueCart - Talisay Branch",
    assignedRider: {
      name: "Mark Rider",
      phone: "+63 998 111 0000",
      vehicle: "Motorcycle",
    },
    deliveryAddress: "Talisay Proper, Cebu",
    latitude: 10.245,
    longitude: 123.849,
  },
];