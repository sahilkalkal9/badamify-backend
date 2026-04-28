import express from "express";
import {
  createStockPurchase,
  getStockPurchases,
  updateStockPurchase,
  deleteStockPurchase,
} from "../controllers/stockPurchaseController.js";

const router = express.Router();

router.post("/", createStockPurchase);
router.get("/", getStockPurchases);
router.put("/:id", updateStockPurchase);
router.delete("/:id", deleteStockPurchase);

export default router;