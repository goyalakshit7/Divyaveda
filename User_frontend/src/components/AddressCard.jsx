import { MapPin, Phone, Home, Briefcase, Check, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isSelected, onSelect }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getAddressIcon = () => {
    switch (address.address_type) {
      case "HOME":
        return <Home size={20} />;
      case "WORK":
        return <Briefcase size={20} />;
      default:
        return <MapPin size={20} />;
    }
  };

  const handleDelete = () => {
    onDelete(address._id);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={`relative p-5 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-200"
          : "border-slate-200 hover:border-slate-300 bg-white"
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 bg-emerald-600 text-white rounded-full p-1">
          <Check size={16} />
        </div>
      )}

      {/* Default Badge */}
      {address.is_default && (
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
            Default Address
          </span>
        </div>
      )}

      {/* Address Type */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-emerald-600">{getAddressIcon()}</div>
        <span className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
          {address.address_type}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-bold text-lg text-slate-900 mb-2">{address.name}</h3>

      {/* Address */}
      <p className="text-slate-600 text-sm leading-relaxed mb-3">
        {address.street}
        {address.landmark && `, ${address.landmark}`}
        <br />
        {address.city}, {address.state} - {address.pincode}
        <br />
        {address.country}
      </p>

      {/* Phone */}
      <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
        <Phone size={16} />
        <span>{address.phone}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address._id)}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
          >
            Set as Default
          </button>
        )}
        
        {onSelect && (
          <button
            onClick={() => onSelect(address)}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition ${
              isSelected
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
        )}

        <button
          onClick={() => onEdit(address)}
          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Edit Address"
        >
          <Edit2 size={18} />
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Delete Address"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Delete Address?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
