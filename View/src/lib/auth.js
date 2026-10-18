export function getStoredToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  try {
    if (token) localStorage.setItem("accessToken", token);
    if (user) localStorage.setItem("user", typeof user === "string" ? user : JSON.stringify(user));
  } catch (e) {
    console.error("Failed to store auth session:", e);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  } catch (e) {
    console.error("Failed to clear auth session:", e);
  }
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getStoredToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
