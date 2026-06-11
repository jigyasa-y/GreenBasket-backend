import express from "express";
import { getAddresses, addAddress,deleteAddress, setDefaultAddress } from "../controllers/address.controller.js";

const router = express.Router();

router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/default/:id", setDefaultAddress);
router.delete("/addresses/:id", deleteAddress);

export default router;