import express from "express";
import {
  createSale,
  getSales,
  updateSale,
  deleteSale,
} from "../controllers/saleController.js";

const router = express.Router();

router.post("/", createSale);
router.get("/", getSales);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);

export default router;