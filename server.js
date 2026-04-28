import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import locationRoutes from "./routes/locationRoutes.js";
import recipeItemRoutes from "./routes/recipeItemRoutes.js";
import setupStuffRoutes from "./routes/setupStuffRoutes.js";
import stockPurchaseRoutes from "./routes/stockPurchaseRoutes.js";
import dailyProductionRoutes from "./routes/dailyProductionRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Badamify Backend Running");
});

app.use("/api/locations", locationRoutes);
app.use("/api/recipe-items", recipeItemRoutes);
app.use("/api/setup-stuff", setupStuffRoutes);
app.use("/api/stock-purchases", stockPurchaseRoutes);
app.use("/api/daily-production", dailyProductionRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});