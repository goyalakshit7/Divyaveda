import { createContext, useContext, useState, useEffect } from "react";
import api, { skipErrorToast } from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

const AuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  sendOtp: async () => {},
  verifyOtpAndRegister: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  fetchProfile: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend
  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch profile", error);
      return null;
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("userToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            // Fetch full user profile from backend
            await fetchProfile();
          } else {
            localStorage.removeItem("userToken");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Invalid token", error);
          localStorage.removeItem("userToken");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      const token = data.token;
      localStorage.setItem("userToken", token);
      
      // Fetch user profile
      const profile = await fetchProfile();
      
      toast.success(`Welcome back${profile?.name ? ', ' + profile.name : ''}!`);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      // Error toast already shown by interceptor
      return false;
    }
  };

  const sendOtp = async (email) => {
    try {
      await api.post("/auth/send-otp", { email });
      toast.success("OTP sent to your email!");
      return true;
    } catch (error) {
      console.error("Failed to send OTP", error);
      // Error toast already shown by interceptor
      return false;
    }
  };

  const verifyOtpAndRegister = async (userData) => {
    try {
      await api.post("/auth/verify-otp-register", userData);
      toast.success("Registration successful! Please login.");
      return true;
    } catch (error) {
      console.error("OTP verification failed", error);
      // Error toast already shown by interceptor
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await api.post("/auth/register", userData);
      toast.success("Registration successful! Please login.");
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      // Error toast already shown by interceptor
      return false;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data } = await api.put("/auth/me", updates);
      setUser(data.user || data);
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("Failed to update profile", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
      setUser(null);
      toast.info("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      sendOtp, 
      verifyOtpAndRegister, 
      logout, 
      updateProfile,
      fetchProfile,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);