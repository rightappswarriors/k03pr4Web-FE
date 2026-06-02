export type ApiOutlet = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  branch_name: string | null;
  branch_address: string | null;
  branch_phone: string | null;
  // Add these two lines:
  latitude: string;
  longitude: string;
};