import express from "express";

import {getproducts, getProductsByCategory, getSingleProduct,  getProductVariants,  getRelatedProducts,  searchProducts,   filterProducts} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/products", getproducts);

router.get("/products/category/:category_id", getProductsByCategory);

router.get("/products/search", searchProducts);

router.get("/products/:id", getSingleProduct);

router.get("/products/:id/variants", getProductVariants);

router.get("/products/:id/related", getRelatedProducts);

router.get("/filter", filterProducts);




export default router;
