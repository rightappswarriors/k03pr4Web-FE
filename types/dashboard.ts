export type DashboardStats = {
  pendingQuotations: number;
  waitingSupplierReplies: number;
  processingOrders: number;
  unreadMessages: number;
  pendingNegotiations: number;
  counterOffersReceived: number;
  acceptedOffers: number;
};

export type ActivityItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type RecentOrder = {
  id: string;
  orderNumber: string;
  supplier: string;
  status: string;
  total: number;
  createdAt: string;
};

export type RecentRfq = {
  id: string;
  rfqNumber: string;
  supplier: string;
  product: string;
  quantity: number;
  supplierCount?: number;
  status: string;
  updatedAt: string;
};

export type DashboardResponse = {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  notifications: NotificationItem[];
  recentOrders: RecentOrder[];
  recentRFQs: RecentRfq[];
};
