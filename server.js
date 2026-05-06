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

// Health / keep alive API
app.get("/api/health", (req, res) => {
  console.log("✅ Health API hit:", new Date().toLocaleString("en-IN"));

  res.status(200).json({
    success: true,
    message: "Badamify Backend Active",
    time: new Date().toISOString(),
  });
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

  const selfUrl = process.env.SELF_URL;

  if (selfUrl) {
    setInterval(async () => {
      try {
        const response = await fetch(`${selfUrl}/api/health`);
        const data = await response.json();

        console.log("🔁 Self ping success:", data.message, new Date().toLocaleString("en-IN"));
      } catch (error) {
        console.log("❌ Self ping failed:", error.message);
      }
    }, 1*60*1000); // every 1 minute
  } else {
    console.log("⚠️ SELF_URL not found in env. Self ping disabled.");
  }
});