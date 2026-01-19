import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("/orders"); // Assuming this endpoint exists
      setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const createOrder = async (orderData) => {
    try {
      const res = await api.post("/orders", orderData);
      toast.success("Order placed successfully!");
      await fetchOrders();
      return res.data;
    } catch (error) {
      console.error("Failed to create order", error);
      return null;
    }
  };

  return (
    <OrderContext.Provider 
      value={{ 
        orders, 
        createOrder, 
        fetchOrders,
        loading 
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
