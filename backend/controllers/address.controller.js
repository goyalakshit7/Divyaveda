import { Address } from "../models/address.master.js";

// Get all addresses for logged-in user
export const getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({
            user_id: req.user._id,
            isActive: true
        }).sort({ is_default: -1, created_at: -1 });

        res.json({ addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new address
export const createAddress = async (req, res) => {
    try {
        const { name, phone, street, landmark, city, state, pincode, country, address_type, is_default } = req.body;

        // Validation
        if (!name || !phone || !street || !city || !state || !pincode) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const address = await Address.create({
            user_id: req.user._id,
            name,
            phone,
            street,
            landmark,
            city,
            state,
            pincode,
            country: country || "India",
            address_type: address_type || "HOME",
            is_default: is_default || false
        });

        res.status(201).json({
            message: "Address added successfully",
            address
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update address
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, street, landmark, city, state, pincode, country, address_type, is_default } = req.body;

        const address = await Address.findOne({
            _id: id,
            user_id: req.user._id,
            isActive: true
        });

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // Update fields
        if (name) address.name = name;
        if (phone) address.phone = phone;
        if (street) address.street = street;
        if (landmark !== undefined) address.landmark = landmark;
        if (city) address.city = city;
        if (state) address.state = state;
        if (pincode) address.pincode = pincode;
        if (country) address.country = country;
        if (address_type) address.address_type = address_type;
        if (is_default !== undefined) address.is_default = is_default;

        await address.save();

        res.json({
            message: "Address updated successfully",
            address
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete address (soft delete)
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            user_id: req.user._id,
            isActive: true
        });

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        address.isActive = false;
        await address.save();

        res.json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            user_id: req.user._id,
            isActive: true
        });

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // The pre-save hook will automatically unset other defaults
        address.is_default = true;
        await address.save();

        res.json({
            message: "Default address updated successfully",
            address
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
