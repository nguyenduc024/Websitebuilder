export const API_BASE = "http://localhost:8080/api";

export async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function registerRefreshOnFocus(refresh: () => void): () => void {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      refresh();
    }
  };

  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}