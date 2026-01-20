import express from "express";
import { register, login, logout, getMe, updateMe, deleteMe, verifyOtpAndRegister, sendOtp, forgotPassword, resetPassword }
    from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();
router.post("/send-otp", sendOtp);
router.post("/verify-otp-register", verifyOtpAndRegister);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

// Forgot password and reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", isAuthenticated, getMe);
router.put("/me", isAuthenticated, updateMe);
router.delete("/me", isAuthenticated, deleteMe);

export default router;
