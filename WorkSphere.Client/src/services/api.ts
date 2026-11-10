/**
 * Centralized API client with automatic CSRF token inclusion and credentials (cookies) handling.
 * JWT tokens are kept strictly in HttpOnly cookies and never stored or handled in localStorage.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  // For POST, PUT, DELETE, PATCH requests, attach the CSRF header read from the non-HttpOnly XSRF-TOKEN cookie
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken && !headers.has('X-XSRF-TOKEN')) {
      headers.set('X-XSRF-TOKEN', csrfToken);
    }
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

    const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // Send and receive HttpOnly session cookies
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMessage);
  }

  // If response is 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

