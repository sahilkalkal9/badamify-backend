import express from "express";
import {
  createRecipeItem,
  getRecipeItems,
  updateRecipeItem,
  deleteRecipeItem,
} from "../controllers/recipeItemController.js";

const router = express.Router();

router.post("/", createRecipeItem);
router.get("/", getRecipeItems);
router.put("/:id", updateRecipeItem);
router.delete("/:id", deleteRecipeItem);

export default router;