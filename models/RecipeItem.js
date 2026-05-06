import mongoose from "mongoose";

const recipeItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "gm", "ltr", "ml", "pcs"],
    },
    pricePerUnit: {
      type: Number,
      required: true,
      default: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
    },
    minStockAlert: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const RecipeItem = mongoose.model("RecipeItem", recipeItemSchema);

export default RecipeItem;