const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  SOCKET: API_BASE_URL,
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    SIGNIN: `${API_BASE_URL}/api/auth/signin`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    PROFILE: `${API_BASE_URL}/api/auth/me`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    GITHUB: `${API_BASE_URL}/api/auth/github`,
  },
  ROOMS: {
    BASE: `${API_BASE_URL}/api/rooms`,
    LIST: `${API_BASE_URL}/api/rooms`,
    CREATE: `${API_BASE_URL}/api/rooms`,
    JOIN: (roomIdOrName: string) => `${API_BASE_URL}/api/rooms/${roomIdOrName}/join`,
    LEAVE: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/leave`,
    END: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/end`,
  },
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_ENDPOINTS;

