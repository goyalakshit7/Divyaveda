import express from "express";
import { SubCategory } from "../../models/subcategory.master.js";

const router = express.Router();

// Get all active subcategories (can filter by category_id)
router.get("/", async (req, res) => {
    try {
        const { category_id } = req.query;

        const filter = { isActive: true };
        if (category_id) {
            filter.category_id = category_id;
        }

        const subcategories = await SubCategory.find(filter)
            .populate("category_id", "name")
            .sort({ created_at: -1 })
            .select("name description category_id");

        res.json({ subcategories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get subcategory by ID
router.get("/:id", async (req, res) => {
    try {
        const subcategory = await SubCategory.findOne({
            _id: req.params.id,
            isActive: true
        }).populate("category_id", "name");

        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        res.json({ subcategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
