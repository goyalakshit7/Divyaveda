import express from "express";
import { getAllProducts, getProductById, getRelatedProducts }
    from "../../controllers/product.public.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

export default router;
