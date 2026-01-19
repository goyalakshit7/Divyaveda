import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return false;
    }

    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      setCart(prev => [...prev, { _id: tempId, product_id: productId, quantity, _isOptimistic: true }]);
      
      await api.post("/cart", { product_id: productId, quantity });
      await fetchCart();
      toast.success("Added to cart!");
      return true;
    } catch (error) {
      console.error("Failed to add to cart", error);
      // Remove optimistic item
      setCart(prev => prev.filter(item => !item._isOptimistic));
      return false;
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    if (quantity < 1) return;

    try {
      // Optimistic update
      setCart(prev =>
        prev.map(item =>
          item._id === cartId ? { ...item, quantity } : item
        )
      );

      await api.put(`/cart/${cartId}`, { quantity });
      await fetchCart();
      return true;
    } catch (error) {
      console.error("Failed to update quantity", error);
      await fetchCart(); // Revert optimistic update
      return false;
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      // Optimistic update
      const itemToRemove = cart.find(item => item._id === cartId);
      setCart(prev => prev.filter(item => item._id !== cartId));

      await api.delete(`/cart/${cartId}`);
      toast.success("Item removed from cart");
      return true;
    } catch (error) {
      console.error("Failed to remove from cart", error);
      await fetchCart(); // Revert optimistic update
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const prevCart = [...cart];
      setCart([]);
      
      await api.delete("/cart");
      toast.success("Cart cleared");
      return true;
    } catch (error) {
      console.error("Failed to clear cart", error);
      await fetchCart();
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        fetchCart,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);