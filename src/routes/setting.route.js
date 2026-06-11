import express from "express";

import {

  getSettings,
  updateSettings,
  changePassword,
  logout

} from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", updateSettings);
router.put("/change-password", changePassword);
router.post("/logout", logout);



export default router;