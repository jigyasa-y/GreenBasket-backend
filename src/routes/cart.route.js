import express from "express";

import {
 getCart,
  addToCart,
  updateCartQuantity,
  deleteCartItem} from "../controllers/cart.controller.js";

const router = express.Router()

router.get("/", getCart);

router.post("/", addToCart);

router.put("/:id", updateCartQuantity);

router.delete("/:id", deleteCartItem);



export default router;