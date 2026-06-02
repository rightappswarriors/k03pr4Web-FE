export type CartItem = {
  id: number;
  product_id: number;
  branch_id: number | null;
  product_name: string;
  image: string | null;
  outlet_name: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export type CartResponse = {
  id: number;
  items: CartItem[];
  total_quantity: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("access") : null;
}

export async function fetchBackendCart(): Promise<CartResponse | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/cart/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("loggedInUser");
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch cart.");
  }

  return res.json();
}

export async function addToBackendCart(product_id: number, quantity = 1, branch_id?: number | null) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated.");

  const res = await fetch(`${API_URL}/cart/add/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product_id,
      quantity,
      branch_id: branch_id ?? null,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to add to cart.");
  }

  return data as CartResponse;
}

export async function updateBackendCartItem(itemId: number, quantity: number) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated.");

  const res = await fetch(`${API_URL}/cart/item/${itemId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to update cart item.");
  }

  return data as CartResponse;
}

export async function removeBackendCartItem(itemId: number) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated.");

  const res = await fetch(`${API_URL}/cart/item/${itemId}/delete/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to remove cart item.");
  }

  return data as CartResponse;
}