import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

const AuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("userToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Optional: Verify with backend if token is actually valid
          // For now, trust the token if not expired
          if (decoded.exp * 1000 > Date.now()) {
             // You might want to fetch full user profile here
            setUser({ ...decoded, token });
          } else {
             localStorage.removeItem("userToken");
          }
        } catch (error) {
          console.error("Invalid token", error);
          localStorage.removeItem("userToken");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      // Assuming backend returns { token, user } or just { token }
      // Adjust based on actual backend response
      const token = data.token; 
      localStorage.setItem("userToken", token);
      
      const decoded = jwtDecode(token);
      setUser({ ...decoded, token, ...data.user });
      
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      console.error("Login failed", error);
      toast.error(error.response?.data?.message || "Login failed");
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
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    setUser(null);
    toast.info("Logged out");
    // Ideally call backend logout too
    api.post("/auth/logout").catch(() => {}); 
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);