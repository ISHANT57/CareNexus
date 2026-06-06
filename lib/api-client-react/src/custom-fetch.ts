export type AuthTokenGetter = () => string | null;
export type CustomFetchOptions = RequestInit;
export type ErrorType<T = unknown> = any;
export type BodyType<T> = T;

let _baseUrl = "";
let _getToken: AuthTokenGetter = () => null;

export function setBaseUrl(url: string) {
  _baseUrl = url;
}

export function setAuthTokenGetter(fn: AuthTokenGetter) {
  _getToken = fn;
}

export async function customFetch<T = unknown>(
  url: string,
  options: CustomFetchOptions = {}
): Promise<T> {
  const token = _getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${_baseUrl}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && typeof window !== "undefined") {
    // If we're unauthorized, clear the token and redirect
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
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
