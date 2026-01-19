import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
    otp: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendOtp, verifyOtpAndRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const strengthMap = {
      0: { label: "Very Weak", color: "bg-red-500" },
      1: { label: "Weak", color: "bg-orange-500" },
      2: { label: "Fair", color: "bg-yellow-500" },
      3: { label: "Good", color: "bg-blue-500" },
      4: { label: "Strong", color: "bg-green-500" }
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const validateStep1 = () => {
    if (!form.username.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!form.phone_number.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    
    if (!validateStep1()) return;

    setLoading(true);
    const success = await sendOtp(form.email);
    setLoading(false);

    if (success) {
      setStep(2);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    
    if (!form.otp || form.otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    const success = await verifyOtpAndRegister({
      username: form.username,
      email: form.email,
      password: form.password,
      phone_number: form.phone_number,
      otp: form.otp
    });
    setLoading(false);

    if (success) {
      navigate("/login");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {step === 1 ? "Create an account" : "Verify your email"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {step === 1 ? (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-700 hover:text-green-800">
                  Sign in
                </Link>
              </>
            ) : (
              `We've sent a 6-digit code to ${form.email}`
            )}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-lg">
          {/* Progress indicator */}
          {step === 2 && (
            <div className="mb-6 flex items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-slate-600">Details</span>
              </div>
              <div className="h-px w-8 bg-slate-300" />
              <div className="flex items-center gap-2">
                <Circle className="h-5 w-5 text-green-600 fill-green-600" />
                <span className="text-sm font-medium text-slate-900">Verify</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <Input
                label="Full Name"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="John Doe"
                autoComplete="name"
              />
              
              <Input
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />

              <Input
                label="Phone Number"
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                required
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {form.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Password strength: <span className="font-medium">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" isLoading={loading}>
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  maxLength="6"
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  required
                  autoComplete="one-time-code"
                />
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      await sendOtp(form.email);
                      setLoading(false);
                    }}
                    className="text-green-700 hover:text-green-800 font-medium"
                  >
                    Resend
                  </button>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-700"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800" isLoading={loading}>
                  Verify & Register
                </Button>
              </div>
            </form>
          )}
          
          {step === 1 && (
            <p className="mt-6 text-xs text-center text-slate-500">
              By signing up, you agree to our{' '}
              <a href="#" className="underline hover:text-slate-700">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-slate-700">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
