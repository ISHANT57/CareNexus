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

// ── Single-flight token refresh ──────────────────────────────────────────────
// Query-heavy pages (e.g. patient detail) fire many requests in parallel. If the
// access token has expired they all receive 401 at once. Because the server
// ROTATES the refresh token, letting each 401 call /auth/refresh independently
// means only the first succeeds and the rest fail on the now-revoked token —
// forcing a spurious logout. We therefore dedupe: concurrent 401s await ONE
// shared refresh and then retry with the new access token.
let _refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!_refreshInFlight) {
    _refreshInFlight = (async () => {
      try {
        // The CSRF middleware requires x-xsrf-token on every POST. The XSRF-TOKEN
        // cookie is set by the server on the preceding GET (e.g. /api/auth/me that
        // triggered the 401). Without this header the refresh returns 403 CSRF and
        // the user is redirected to login even though their refresh token is valid.
        const xsrfToken = getXsrfToken();
        const refreshHeaders: Record<string, string> = { "Content-Type": "application/json" };
        if (xsrfToken) refreshHeaders["x-xsrf-token"] = xsrfToken;

        const res = await fetch(`${_baseUrl}/api/auth/refresh`, {
          method: "POST",
          headers: refreshHeaders,
          body: JSON.stringify({}),
          credentials: "include",
        });
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        const token = data?.accessToken as string | undefined;
        if (token) {
          localStorage.setItem("access_token", token);
          return token;
        }
        return null;
      } catch {
        return null;
      } finally {
        _refreshInFlight = null;
      }
    })();
  }
  return _refreshInFlight;
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
    const path = window.location.pathname;
    if (path !== "/login" && path !== "/register") {
      // Shared (single-flight) refresh — never rotates concurrently.
      const newToken = await refreshAccessToken();

      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        const retryRes = await fetch(`${_baseUrl}${url}`, { ...options, headers, credentials: "include" });
        if (retryRes.ok) {
          if (retryRes.status === 204) return undefined as unknown as T;
          return retryRes.json() as Promise<T>;
        }
        // Retry returned a non-OK status that is NOT an auth problem (e.g. 403/404
        // on the resource itself) — surface it as a normal error, do NOT log out.
        const retryErr = await retryRes.json().catch(() => ({ error: retryRes.statusText }));
        throw Object.assign(new Error(retryRes.statusText), {
          status: retryRes.status,
          statusText: retryRes.statusText,
          data: retryErr,
          headers: retryRes.headers,
        });
      }

      // Refresh genuinely failed → session is over. Clear token and redirect.
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      // Throw so the Promise rejects cleanly; the browser navigation above will
      // complete asynchronously and this error is never actually surfaced to UI.
      throw Object.assign(new Error("Session expired"), { status: 401 });
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
