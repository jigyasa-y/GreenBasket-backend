import express from "express";

import {

  addPaymentMethod,
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod

} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/payments", addPaymentMethod);
router.get("/payments", getPaymentMethods);
router.put("/default/:id", setDefaultPaymentMethod);
router.delete("/:id", deletePaymentMethod);



export default router;