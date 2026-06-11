import express from "express";
import { getCards,addCard,deleteCard } from "../controllers/card.controller.js";

const router = express.Router();

router.get("/cards", getCards);
router.post("/cards", addCard);
router.delete("/cards/:id", deleteCard);

export default router;