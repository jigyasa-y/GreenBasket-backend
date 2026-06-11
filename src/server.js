import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import productRoute from "./routes/product.route.js";
import categoryRoute from "./routes/category.route.js";
import favouriteRoute from "./routes/favourite.route.js";
import bannerRoute from "./routes/banner.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";
import accountRoutes from "./routes/account.route.js";
import addressRoutes from "./routes/address.route.js";
import cardRoutes from "./routes/card.route.js";
import paymentRoutes from "./routes/payment.route.js";
import settingsRoutes from "./routes/setting.route.js";


const app=express();
dotenv.config();


const PORT=process.env.PORT;

app.use(cors());
app.use(express.json());
// app.use(helmet());



app.use("/api/auth", authRoute);
app.use("/api", productRoute);
app.use("/api", categoryRoute);
app.use("/api", favouriteRoute);
app.use("/api", bannerRoute);
app.use("/api/cart", cartRoute);
app.use("/api", orderRoute);
app.use("/api/account", accountRoutes);
app.use("/api", addressRoutes);
app.use("/api", cardRoutes);
app.use("/api", paymentRoutes);
app.use("/api/settings", settingsRoutes);

const testDB=async ()=>{
  try{
    const result=await db.query("SELECT*from products");
    console.log("database is connected");
  } catch (error) {
    console.error("Error connecting to database:", error.message);

  }
};


testDB();





app.listen(PORT, ()=>{
  console.log("server is running at http:localhost:",PORT);
})

export default app;

