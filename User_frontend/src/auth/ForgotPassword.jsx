import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/Button";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">Password Reset Successful!</h2>
            <p className="text-slate-500 mt-2">You can now login with your new password.</p>
          </div>
          <Link to="/login">
            <Button className="bg-green-700 hover:bg-green-800">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {step === 1 ? "Forgot Password?" : "Reset Your Password"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {step === 1 ? (
              <>
                Don't worry! Enter your email and we'll send you an OTP to reset your password.
              </>
            ) : (
              `We've sent a 6-digit OTP to ${email}`
            )}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            // Step 1: Email Input
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-11 h-5 w-5 text-slate-400" />
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-700 hover:bg-green-800"
                isLoading={loading}
              >
                Send OTP
              </Button>
            </form>
          ) : (
            // Step 2: OTP + New Password
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  required
                />
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-green-700 hover:text-green-800 font-medium"
                  >
                    Resend
                  </button>
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  required
                />
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
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-700 hover:bg-green-800"
                  isLoading={loading}
                >
                  Reset Password
                </Button>
              </div>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
