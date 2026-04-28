import express from "express";
import {
  createSetupStuff,
  getSetupStuff,
  updateSetupStuff,
  deleteSetupStuff,
} from "../controllers/setupStuffController.js";

const router = express.Router();

router.post("/", createSetupStuff);
router.get("/", getSetupStuff);
router.put("/:id", updateSetupStuff);
router.delete("/:id", deleteSetupStuff);

export default router;