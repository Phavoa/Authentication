import { create } from "zustand";
import axios from "axios";
import { verifyEmail } from "../../../backend/controllers/auth.controller";

const API_URL = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true;
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
      });
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },
  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/verify-email`, { code });
      set({ user: data?.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },
}));