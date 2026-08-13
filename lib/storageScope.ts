// lib/storageScope.ts
export function getStorageScope(): string {
  if (typeof window === "undefined") return "guest";
  try {
    const raw = localStorage.getItem("loggedInUser");
    if (!raw) return "guest";
    const user = JSON.parse(raw);
    return String(user.email ?? "guest");
  } catch {
    return "guest";
  }
}