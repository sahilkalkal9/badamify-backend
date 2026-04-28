import express from "express";
import {
  createDailyProduction,
  getDailyProductions,
  deleteDailyProduction,
} from "../controllers/dailyProductionController.js";

const router = express.Router();

router.post("/", createDailyProduction);
router.get("/", getDailyProductions);
router.delete("/:id", deleteDailyProduction);

export default router;