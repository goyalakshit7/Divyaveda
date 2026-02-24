import { useState } from "react";
import { MapPin, Phone, Home, Briefcase, X } from "lucide-react";
import Button from "./Button";

const AddressForm = ({ address, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: address?.name || "",
    phone: address?.phone || "",
    street: address?.street || "",
    landmark: address?.landmark || "",
    city: address?.city || "",
    state: address?.state || "",
    pincode: address?.pincode || "",
    country: address?.country || "India",
    address_type: address?.address_type || "HOME",
    is_default: address?.is_default || false
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(formData.phone.trim())) 
      newErrors.phone = "Phone must be 10 digits";
    
    if (!formData.street.trim()) newErrors.street = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) 
      newErrors.pincode = "Pincode must be 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {address ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["HOME", "WORK", "OTHER"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, address_type: type })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                    formData.address_type === type
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {type === "HOME" && <Home size={18} />}
                  {type === "WORK" && <Briefcase size={18} />}
                  {type === "OTHER" && <MapPin size={18} />}
                  <span className="font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name and Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? "border-red-500" : "border-slate-300"
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                    errors.phone ? "border-red-500" : "border-slate-300"
                  } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="1234567890"
                  maxLength="10"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.street ? "border-red-500" : "border-slate-300"
              } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              placeholder="House No., Building Name, Street"
            />
            {errors.street && (
              <p className="text-red-500 text-sm mt-1">{errors.street}</p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Near Metro Station"
            />
          </div>

          {/* City, State, Pincode */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.city ? "border-red-500" : "border-slate-300"
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                placeholder="Mumbai"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.state ? "border-red-500" : "border-slate-300"
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                placeholder="Maharashtra"
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.pincode ? "border-red-500" : "border-slate-300"
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                placeholder="400001"
                maxLength="6"
              />
              {errors.pincode && (
                <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label className="text-sm font-medium text-slate-700">
              Set as default address
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {address ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
