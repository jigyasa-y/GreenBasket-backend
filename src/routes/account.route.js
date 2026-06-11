import express from 'express';
import { getAccount, updateAccount, updateLanguage } from '../controllers/account.controller.js';

const router=express.Router();

router.get("/account", getAccount);
router.put("/account", updateAccount);
router.put("/language", updateLanguage);

export default router;
