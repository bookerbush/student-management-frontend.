// src/api.js
import { API_BASE_URL } from "./config";

async function request(endpoint, options = {}) {
  // Ensure endpoint starts with "/" so we don’t accidentally get bad URLs
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${localStorage.getItem("token")}` // future JWT use
  };

  const config = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text(); // fallback for plain text responses
    }

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`
      );
    }

    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
}

// Convenience functions
export function apiGet(endpoint) {
  return request(endpoint, { method: "GET" });
}

export function apiPost(endpoint, data) {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiPut(endpoint, data) {
  return request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function apiDelete(endpoint) {
  return request(endpoint, { method: "DELETE" });
}
export default { apiGet, apiPost, apiPut, apiDelete };
