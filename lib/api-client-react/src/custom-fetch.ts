export type AuthTokenGetter = () => string | null;
export type CustomFetchOptions = RequestInit;
export type ErrorType<T = unknown> = any;
export type BodyType<T> = T;

let _baseUrl = "";
let _getToken: AuthTokenGetter = () => null;
let _getTenantId: () => string | null = () => null;

export function setBaseUrl(url: string) {
  _baseUrl = url;
}

export function setAuthTokenGetter(fn: AuthTokenGetter) {
  _getToken = fn;
}

export function setTenantIdGetter(fn: () => string | null) {
  _getTenantId = fn;
}

function getXsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function customFetch<T = unknown>(
  url: string,
  options: CustomFetchOptions = {}
): Promise<T> {
  const token = _getToken();
  const tenantId = _getTenantId();
  const headers = new Headers(options.headers);
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  if (tenantId && !headers.has("x-tenant-id")) headers.set("x-tenant-id", tenantId);
  
  const xsrfToken = getXsrfToken();
  if (xsrfToken) headers.set("x-xsrf-token", xsrfToken);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${_baseUrl}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && typeof window !== "undefined") {
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      try {
        // Attempt to refresh the token
        const refreshRes = await fetch(`${_baseUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          credentials: "include",
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("access_token", data.accessToken);
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          
          // Retry original request
          const retryRes = await fetch(`${_baseUrl}${url}`, {
            ...options,
            headers,
            credentials: "include",
          });

          if (retryRes.ok) {
            if (retryRes.status === 204) return undefined as unknown as T;
            return retryRes.json() as Promise<T>;
          }
        }
      } catch (err) {
        // Fall through to logout
      }

      // If refresh fails, clear everything and redirect to login
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw Object.assign(new Error(response.statusText), {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
      headers: response.headers,
    });
  }

  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}
