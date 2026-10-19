// Authentication helper for PackPort Client

export function getStoredToken() {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) return token;
    
    // Fallback: parse from client document.cookie if available
    if (typeof document !== "undefined" && document.cookie) {
      const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    return null;
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
    if (token) {
      localStorage.setItem("accessToken", token);
      if (typeof document !== "undefined") {
        const isSecure = window.location.protocol === "https:";
        const secureFlag = isSecure ? "; Secure; SameSite=None" : "; SameSite=Lax";
        // 7 days expiration
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=${maxAge}${secureFlag}`;
        document.cookie = `packport_auth=true; path=/; max-age=${maxAge}${secureFlag}`;
      }
    }
    if (user) {
      localStorage.setItem("user", typeof user === "string" ? user : JSON.stringify(user));
    }
  } catch (e) {
    console.error("Failed to store auth session:", e);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    if (typeof document !== "undefined") {
      // Clear all path and security variations for client-set cookies
      const clearFlags = [
        "path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax",
        "path=/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax",
        "path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=None",
        "path=/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=None",
      ];
      clearFlags.forEach((flag) => {
        document.cookie = `accessToken=; ${flag}`;
        document.cookie = `packport_auth=; ${flag}`;
        document.cookie = `packport_session=; ${flag}`;
      });
    }
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

export function isAuthenticated() {
  return Boolean(getStoredToken());
}
