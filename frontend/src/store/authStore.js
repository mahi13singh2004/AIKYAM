import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = "http://localhost:5000";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthenticating: false,
  err: null,
  isProcessing: false,
  unsafeLocations: [],
  isLoadingLocations: false,
  locationError: null,

  signup: async (username, email, password) => {
    set({ isAuthenticating: true, err: null });
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, { username, email, password });
      set({ user: res.data.user, isAuthenticated: true, isAuthenticating: false });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      console.error("Signup Error:", errorMessage, error.response?.data);
      set({ err: errorMessage, isAuthenticating: false });
      throw new Error(errorMessage);
    }
  },

  login: async (email, password) => {
    set({ isAuthenticating: true, err: null });
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      set({ user: res.data.user, isAuthenticated: true, isAuthenticating: false });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      console.error("Login Error:", errorMessage, error.response?.data);
      set({ err: errorMessage, isAuthenticating: false });
      throw new Error(errorMessage);
    }
  },

  checkAuth: async () => {
    set({ isAuthenticating: true, err: null });
    try {
      const res = await axios.get(`${API_URL}/api/auth/checkAuth`);
      set({ user: res.data.user, isAuthenticated: true, isAuthenticating: false });
      return res.data;
    } catch (error) {
      console.log(error)
      set({ user: null, isAuthenticated: false, isAuthenticating: false, err: null });
      return null;
    }
  },

  logout: async () => {
    set({ isAuthenticating: true, err: null });
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      set({ user: null, isAuthenticated: false, isAuthenticating: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Logout failed";
      console.error("Logout Error:", errorMessage, error.response?.data);
      set({ err: errorMessage, isAuthenticating: false });
      throw new Error(errorMessage);
    }
  },

  chat: async (message) => {
    set({ isProcessing: true, err: null });
    try {
      const res = await axios.post(`${API_URL}/api/counselor/`, { message }, { withCredentials: true });
      console.log("Backend response:", res.data); // Debug full response
      set({ isProcessing: false });
      return res.data.message; // Return only the message string
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to get response";
      console.error("Chat Error:", errorMessage, error.response?.data || error);
      set({ isProcessing: false, err: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchUnsafeLocations: async () => {
    set({ isLoadingLocations: true, locationError: null });
    try {
      const res = await axios.get(`${API_URL}/api/unsafe`);
      set({ unsafeLocations: res.data, isLoadingLocations: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch locations";
      console.error("Fetch Locations Error:", errorMessage, error.response?.data);
      set({ locationError: errorMessage, isLoadingLocations: false });
      throw new Error(errorMessage);
    }
  },

  markLocationAsUnsafe: async (lat, lng) => {
    set({ isLoadingLocations: true, locationError: null });
    try {
      const res = await axios.post(`${API_URL}/api/unsafe`, { lat: parseFloat(lat), lng: parseFloat(lng) });
      set((state) => ({ unsafeLocations: [...state.unsafeLocations, res.data], isLoadingLocations: false }));
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to mark location";
      console.error("Mark Location Error:", errorMessage, error.response?.data);
      set({ locationError: errorMessage, isLoadingLocations: false });
      throw new Error(errorMessage);
    }
  },
}));