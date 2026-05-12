import StockPurchase from "../models/StockPurchase.js";
import RecipeItem from "../models/RecipeItem.js";
import { reconcileRecipeItemStock } from "../utils/inventory.js";

export const createStockPurchase = async (req, res) => {
  try {
    const { item, pricePerUnit } = req.body;

    const recipeItem = await RecipeItem.findById(item);

    if (!recipeItem) {
      return res.status(404).json({
        success: false,
        message: "Recipe item not found",
      });
    }

    const payload = {
      ...req.body,
      itemName: recipeItem.name,
      unit: recipeItem.unit,
      pricePerUnit: pricePerUnit ?? recipeItem.pricePerUnit,
    };

    delete payload.location;

    const purchase = await StockPurchase.create(payload);

    recipeItem.pricePerUnit = Number(payload.pricePerUnit || 0);

    await recipeItem.save();
    await reconcileRecipeItemStock([recipeItem._id]);

    res.status(201).json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStockPurchases = async (req, res) => {
  try {
    const { from, to } = req.query;

    const filter = {};

    if (from || to) {
      filter.purchaseDate = {};

      if (from) {
        filter.purchaseDate.$gte = new Date(from);
      }

      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.purchaseDate.$lte = toDate;
      }
    }

    const purchases = await StockPurchase.find(filter)
      .populate("item", "name unit currentStock")
      .sort({ purchaseDate: -1 });

    res.json({
      success: true,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateStockPurchase = async (req, res) => {
  try {
    const purchase = await StockPurchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Stock purchase not found",
      });
    }

    const oldItemId = purchase.item?.toString();

    const payload = { ...req.body };
    delete payload.location;

    if (payload.item) {
      const recipeItem = await RecipeItem.findById(payload.item);

      if (!recipeItem) {
        return res.status(404).json({
          success: false,
          message: "Recipe item not found",
        });
      }

      payload.itemName = recipeItem.name;
      payload.unit = recipeItem.unit;
    }

    Object.assign(purchase, payload);

    await purchase.save();

    const newItemId = purchase.item?.toString();

    const recipeItem = await RecipeItem.findById(newItemId);

    if (recipeItem) {
      recipeItem.pricePerUnit = Number(purchase.pricePerUnit || 0);
      await recipeItem.save();
    }

    await reconcileRecipeItemStock([oldItemId, newItemId]);

    res.json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteStockPurchase = async (req, res) => {
  try {
    const purchase = await StockPurchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Stock purchase not found",
      });
    }

    const itemId = purchase.item;

    await purchase.deleteOne();
    await reconcileRecipeItemStock([itemId]);

    res.json({
      success: true,
      message: "Stock purchase deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
