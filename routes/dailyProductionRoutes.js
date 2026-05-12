import express from "express";
import {
  createDailyProduction,
  getDailyProductions,
  updateDailyProduction,
  deleteDailyProduction,
} from "../controllers/dailyProductionController.js";

const router = express.Router();

router.post("/", createDailyProduction);
router.get("/", getDailyProductions);
router.put("/:id", updateDailyProduction);
router.delete("/:id", deleteDailyProduction);

export default router;
