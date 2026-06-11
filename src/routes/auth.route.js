import express from "express";
import {Signup, Signin, forgotPassword, resetPassword ,  sendOTP, verifyOTP, resendOTP}  from "../controllers/auth.controller.js";

import forgotLimiter from "../middleware/rateLimit.js";

const Routes=express.Router();

Routes.post("/signup", Signup);
Routes.post("/signin", Signin);
Routes.post("/forgot-password", forgotLimiter, forgotPassword);
Routes.post("/reset-password/:token", resetPassword);
Routes.post("/send-otp", sendOTP);
Routes.post("/verify-otp", verifyOTP);
Routes.post("/resend-otp", resendOTP);








export default Routes;