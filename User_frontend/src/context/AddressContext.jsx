import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const AddressContext = createContext();

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddress must be used within AddressProvider");
  }
  return context;
};

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all user addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/addresses");
      setAddresses(res.data.addresses || []);
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    } finally {
      setLoading(false);
    }
  };

  // Create new address
  const createAddress = async (addressData) => {
    try {
      const res = await api.post("/addresses", addressData);
      toast.success(res.data.message || "Address added successfully!");
      await fetchAddresses();
      return res.data.address;
    } catch (error) {
      console.error("Failed to create address", error);
      toast.error(error.response?.data?.message || "Failed to add address");
      return null;
    }
  };

  // Update address
  const updateAddress = async (id, addressData) => {
    try {
      const res = await api.put(`/addresses/${id}`, addressData);
      toast.success(res.data.message || "Address updated successfully!");
      await fetchAddresses();
      return res.data.address;
    } catch (error) {
      console.error("Failed to update address", error);
      toast.error(error.response?.data?.message || "Failed to update address");
      return null;
    }
  };

  // Delete address
  const deleteAddress = async (id) => {
    try {
      const res = await api.delete(`/addresses/${id}`);
      toast.success(res.data.message || "Address deleted successfully!");
      await fetchAddresses();
      return true;
    } catch (error) {
      console.error("Failed to delete address", error);
      toast.error(error.response?.data?.message || "Failed to delete address");
      return false;
    }
  };

  // Set default address
  const setDefaultAddress = async (id) => {
    try {
      const res = await api.put(`/addresses/${id}/default`);
      toast.success(res.data.message || "Default address updated!");
      await fetchAddresses();
      return true;
    } catch (error) {
      console.error("Failed to set default address", error);
      toast.error(error.response?.data?.message || "Failed to update default address");
      return false;
    }
  };

  // Get default address
  const getDefaultAddress = () => {
    return addresses.find(addr => addr.is_default);
  };

  useEffect(() => {
    // Fetch addresses on mount if user is logged in
    const token = localStorage.getItem("userToken");
    if (token) {
      fetchAddresses();
    }
  }, []);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getDefaultAddress
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};
