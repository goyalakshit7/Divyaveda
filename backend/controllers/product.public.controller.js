import { Product } from "../models/product.master.js";
import { Category } from "../models/category.master.js";
import { SubCategory } from "../models/subcategory.master.js";
import { RelatedProduct } from "../models/relatedProduct.master.js";

/* ================= GET ALL PRODUCTS (PUBLIC) ================= */
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    const query = { isActive: true };

    // category can be an ObjectId OR a name slug like "immunity"
    if (category) {
      const isObjectId = /^[a-f\d]{24}$/i.test(category);
      if (isObjectId) {
        query.category_id = category;
      } else {
        const cat = await Category.findOne({ name: { $regex: `^${category}$`, $options: "i" } }).select("_id");
        if (cat) query.category_id = cat._id;
        else query.category_id = null; // no products will match — clean 0-result response
      }
    }

    // subcategory can be an ObjectId OR a name slug
    if (subcategory) {
      const isObjectId = /^[a-f\d]{24}$/i.test(subcategory);
      if (isObjectId) {
        query.subcategory_id = subcategory;
      } else {
        const sub = await SubCategory.findOne({ name: { $regex: `^${subcategory}$`, $options: "i" } }).select("_id");
        if (sub) query.subcategory_id = sub._id;
        else query.subcategory_id = null;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { created_at: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    const products = await Product.find(query)
      .populate("category_id", "name")
      .populate("subcategory_id", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort(sortOption);

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET PRODUCT BY ID (PUBLIC) ================= */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate("category_id", "name")
      .populate("subcategory_id", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET RELATED PRODUCTS ================= */
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const related = await RelatedProduct.find({ product_id: id })
      .populate({
        path: "related_product_id",
        select: "name price main_image diplayPrice"
      });

    // Extract the actual product data from the relationship
    const relatedProducts = related
      .map(item => item.related_product_id)
      .filter(item => item !== null); // Filter out any nulls incase product was deleted

    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
