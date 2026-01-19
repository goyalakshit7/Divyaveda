import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { User, Mail, Phone, MapPin, Calendar, LogOut, Trash2, Save, Edit2, X } from "lucide-react";

const Profile = () => {
  const { user, updateProfile, logout, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    address: "",
    age: "",
    gender: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        age: user.age || "",
        gender: user.gender || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProfile(formData);
    if ( success) {
      await fetchProfile();
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || user.name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      address: user.address || "",
      age: user.age || "",
      gender: user.gender || ""
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900">My Profile</h1>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="border-slate-300 text-slate-700"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-8 py-12 text-center border-b border-slate-200">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-600 text-white text-3xl font-bold shadow-lg">
            {formData.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">{formData.username || "User"}</h2>
          <p className="text-slate-500 text-sm">{formData.email}</p>
        </div>

        <div className="p-8 space-y-6">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
                
                <Input
                  label="Phone Number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>

              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, City, State, PIN"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  isLoading={isSaving}
                  className="flex-1 bg-green-700 hover:bg-green-800"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 border-slate-300 text-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <User className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="text-slate-900 font-medium">{formData.username || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-slate-900 font-medium">{formData.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Phone className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="text-slate-900 font-medium">{formData.phone_number || "Not provided"}</p>
                </div>
              </div>

              {formData.address && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-slate-900 font-medium">{formData.address}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                  {formData.age && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Age</p>
                        <p className="text-slate-900 font-medium">{formData.age} years</p>
                      </div>
                    </div>
                  )}

                  {formData.gender && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <User className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Gender</p>
                        <p className="text-slate-900 font-medium capitalize">{formData.gender}</p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="border-t border-slate-200 p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Links</h3>
            
            <Link
              to="/orders"
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="font-medium text-slate-900">My Orders</span>
              <span className="text-slate-400">→</span>
            </Link>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-center border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full justify-center border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Account?</h3>
            <p className="text-slate-600 text-sm mb-6">
              This action cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-slate-300 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
