import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Button from "../components/Button";
import Input from "../components/Input";
import { User, Mail, Phone, ShieldAlert, Save } from "lucide-react";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    username: "",
    phone_number: "",
    email: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        phone_number: user.phone_number || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/auth/me", {
        username: form.username,
        phone_number: form.phone_number
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    const password = prompt("Enter password to deactivate your account");
    if (!password) return;
    try {
      await api.delete("/auth/me", { data: { password } });
      logout();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || "Deactivate failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 pt-8">
      <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Sidebar/Info Card */}
         <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
               <div className="h-24 w-24 mx-auto bg-gradient-to-tr from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4">
                  {form.username?.charAt(0).toUpperCase() || 'U'}
               </div>
               <h2 className="text-xl font-bold text-slate-900">{form.username || 'User'}</h2>
               <p className="text-slate-500 text-sm mt-1">{form.email}</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Account Actions</h3>
               <Button 
                 variant="danger" 
                 className="w-full justify-start bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-none"
                 onClick={handleDeactivate}
               >
                 <ShieldAlert className="mr-2 h-4 w-4" />
                 Deactivate Account
               </Button>
            </div>
         </div>
         
         {/* Main Content */}
         <div className="md:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
               <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 font-serif">
                 <User className="h-5 w-5 text-green-600" />
                 Personal Information
               </h2>
               
               <form onSubmit={handleSave} className="space-y-6">
                 <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Full Name"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      icon={<User className="h-4 w-4" />}
                    />
                    
                    <Input
                      label="Email Address"
                      name="email"
                      value={form.email}
                      disabled
                      className="opacity-60 cursor-not-allowed bg-slate-50"
                      icon={<Mail className="h-4 w-4" />}
                    />
                    
                    <Input
                      label="Phone Number"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      icon={<Phone className="h-4 w-4" />}
                    />
                 </div>
                 
                 <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <Button type="submit" isLoading={isSaving} size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                 </div>
               </form>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Profile;





