// src/api.js

// ✅ Use env variable in production, fallback to localhost for local dev
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

async function request(endpoint, options = {}) {
  // Ensure endpoint starts with "/"
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${localStorage.getItem("token")}` // for JWT later
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
      data = await response.text();
    }

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          statusText: response.statusText,
          data,
        },
      };
    }

    // ✅ Wrap in axios-style response object
    return { data };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Convenience functions (axios-style: they return { data })
export function apiGet(endpoint) {
  return request(endpoint, { method: "GET" });
}

export function apiPost(endpoint, data, headers = {}) {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers,
  });
}

export function apiPut(endpoint, data, headers = {}) {
  return request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    headers,
  });
}

export function apiDelete(endpoint, headers = {}) {
  return request(endpoint, { method: "DELETE", headers });
}

export default { apiGet, apiPost, apiPut, apiDelete };
