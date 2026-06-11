import express from 'express';
import { addFavourite, deleteFavourite, getFavourites} from '../controllers/favourite.controller.js';

const router = express.Router();

router.post("/favorites", addFavourite);
router.get("/favorites", getFavourites);
router.delete("/favorites/:id", deleteFavourite);





export default router;