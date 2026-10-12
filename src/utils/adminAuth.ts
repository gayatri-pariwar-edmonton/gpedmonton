export function adminHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  const token = localStorage.getItem("adminToken");
  if (token) result.set("Authorization", `Bearer ${token}`);
  return result;
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(input, { ...init, headers: adminHeaders(init.headers) });
  if (response.status === 401) {
    localStorage.removeItem("adminToken");
    window.location.assign("/admin/login");
  }
  return response;
}
