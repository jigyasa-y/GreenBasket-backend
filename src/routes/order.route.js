import express from 'express';

import { placeOrder, getOrders,  getOrderDetails } from '../controllers/order.controller.js'; 

const router= express.Router();

router.post("/orders", placeOrder);
router.get("/orders", getOrders);
router.get("/orders/:id",  getOrderDetails);

export default router;