import express from "express";
import {
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controllers/address.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();


router.use(isAuthenticated);

// Get all addresses for logged-in user
router.get("/", getUserAddresses);


router.post("/", createAddress);

// Update address
router.put("/:id", updateAddress);

// Delete address
router.delete("/:id", deleteAddress);

// Set default address
router.put("/:id/default", setDefaultAddress);

export default router;
