import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

const GUEST_CART_KEY = "divyaveda_guest_cart";

const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || []; }
  catch { return []; }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Fetch server cart ────────────────────────────────────────────
  const fetchCart = async () => {
    if (!user) {
      setCart(getGuestCart());
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

  // ── On user change: merge guest cart → server cart on login ──────
  useEffect(() => {
    if (user) {
      const merge = async () => {
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          try {
            for (const item of guestItems) {
              const productId = typeof item.product_id === "object"
                ? item.product_id?._id
                : item.product_id;
              if (productId) {
                await api.post("/cart", { product_id: productId, quantity: item.quantity });
              }
            }
            localStorage.removeItem(GUEST_CART_KEY);
            toast.success("Your saved cart items have been added!");
          } catch (e) {
            console.error("Failed to merge guest cart", e);
          }
        }
        fetchCart();
      };
      merge();
    } else {
      setCart(getGuestCart());
    }
  }, [user]);

  // ── Add to cart ──────────────────────────────────────────────────
  // productData: pass the full product object for guest cart display
  const addToCart = async (productId, quantity = 1, productData = null) => {
    if (!user) {
      // Guest cart — store in localStorage with product details
      const guestCart = getGuestCart();
      const existing = guestCart.find(
        (item) => (item.product_id?._id || item.product_id) === productId
      );
      let updated;
      if (existing) {
        updated = guestCart.map((item) =>
          (item.product_id?._id || item.product_id) === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem = {
          _id: `guest-${productId}-${Date.now()}`,
          product_id: productData ? { ...productData, _id: productId } : { _id: productId },
          quantity,
        };
        updated = [...guestCart, newItem];
      }
      saveGuestCart(updated);
      setCart(updated);
      toast.success("Added to cart!");
      return true;
    }

    // Logged-in: server cart
    try {
      const tempId = `temp-${Date.now()}`;
      setCart((prev) => [
        ...prev,
        { _id: tempId, product_id: productId, quantity, _isOptimistic: true },
      ]);
      await api.post("/cart", { product_id: productId, quantity });
      await fetchCart();
      toast.success("Added to cart!");
      return true;
    } catch (error) {
      console.error("Failed to add to cart", error);
      setCart((prev) => prev.filter((item) => !item._isOptimistic));
      return false;
    }
  };

  // ── Update quantity ──────────────────────────────────────────────
  const updateQuantity = async (cartId, quantity) => {
    if (quantity < 1) return;

    if (!user) {
      const updated = cart.map((item) =>
        item._id === cartId ? { ...item, quantity } : item
      );
      saveGuestCart(updated);
      setCart(updated);
      return true;
    }

    try {
      setCart((prev) =>
        prev.map((item) => (item._id === cartId ? { ...item, quantity } : item))
      );
      await api.put(`/cart/${cartId}`, { quantity });
      await fetchCart();
      return true;
    } catch (error) {
      console.error("Failed to update quantity", error);
      await fetchCart();
      return false;
    }
  };

  // ── Remove from cart ─────────────────────────────────────────────
  const removeFromCart = async (cartId) => {
    if (!user) {
      const updated = cart.filter((item) => item._id !== cartId);
      saveGuestCart(updated);
      setCart(updated);
      toast.success("Item removed from cart");
      return true;
    }

    try {
      setCart((prev) => prev.filter((item) => item._id !== cartId));
      await api.delete(`/cart/${cartId}`);
      toast.success("Item removed from cart");
      return true;
    } catch (error) {
      console.error("Failed to remove from cart", error);
      await fetchCart();
      return false;
    }
  };

  // ── Clear cart ───────────────────────────────────────────────────
  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart([]);
      return true;
    }

    try {
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
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);