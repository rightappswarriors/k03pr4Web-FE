export interface RFQSubmission {
  id: string;
  product: string;
  quantity: string;
  status: "received" | "quoted" | "accepted" | "rejected";
}

export interface RFQDetails {
  productName: string;
  quantity: string;
  unit: string;
  targetPrice?: string;
  message?: string;
}