import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const success = await register(form);
    setLoading(false);
    
    if (success) {
      navigate("/");
    } else {
      // Error handled in context/toast, but concise fallback here
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
            
            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Create a strong password"
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Create account
            </Button>
          </form>
          
          <p className="mt-6 text-xs text-center text-slate-500">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-slate-400">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-slate-400">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

