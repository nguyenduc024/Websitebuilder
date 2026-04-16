export const API_BASE = "http://localhost:8080/api";

// Cache để giữ data khi fetch lỗi tạm thời
const apiCache = new Map<string, unknown>();

export async function fetchApi<T>(path: string): Promise<T> {
  try {
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

    const data = await response.json() as T;
    // Lưu cache khi fetch thành công
    apiCache.set(path, data);
    return data;
  } catch (err) {
    // Trả về cache cũ nếu có, tránh mất data
    const cached = apiCache.get(path) as T | undefined;
    if (cached !== undefined) {
      return cached;
    }
    throw err;
  }
}

export function registerRefreshOnFocus(refresh: () => void): () => void {
  // Chỉ refresh khi tab/window visible trở lại, debounce tránh gọi liên tục
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debouncedRefresh = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(refresh, 300);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      debouncedRefresh();
    }
  };

  window.addEventListener("focus", debouncedRefresh);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    if (timeout) clearTimeout(timeout);
    window.removeEventListener("focus", debouncedRefresh);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}