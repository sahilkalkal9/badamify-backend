import DailyProduction from "../models/DailyProduction.js";
import RecipeItem from "../models/RecipeItem.js";
import {
  getItemId,
  getQuantityMap,
  reconcileRecipeItemStock,
} from "../utils/inventory.js";

const buildProductionItems = async (itemsUsed = []) => {
  const requestedItems = getQuantityMap(itemsUsed);
  const finalItems = [];

  for (const [itemId, quantityUsed] of requestedItems.entries()) {
    if (quantityUsed <= 0) continue;

    const recipeItem = await RecipeItem.findById(itemId);

    if (!recipeItem) {
      const error = new Error(`Recipe item not found: ${itemId}`);
      error.statusCode = 404;
      throw error;
    }

    finalItems.push({
      item: recipeItem._id,
      itemName: recipeItem.name,
      quantityUsed,
      unit: recipeItem.unit,
      pricePerUnit: recipeItem.pricePerUnit,
      cost: quantityUsed * recipeItem.pricePerUnit,
    });
  }

  return finalItems;
};

const ensureStockAvailable = async (newItems = [], oldItems = []) => {
  const oldQuantities = getQuantityMap(oldItems);

  for (const used of newItems) {
    const itemId = getItemId(used.item);
    const recipeItem = await RecipeItem.findById(itemId);

    if (!recipeItem) {
      const error = new Error(`Recipe item not found: ${itemId}`);
      error.statusCode = 404;
      throw error;
    }

    const availableStock =
      Number(recipeItem.currentStock || 0) + Number(oldQuantities.get(itemId) || 0);

    if (availableStock < Number(used.quantityUsed || 0)) {
      const error = new Error(`${recipeItem.name} stock is not enough`);
      error.statusCode = 400;
      throw error;
    }
  }
};

export const createDailyProduction = async (req, res) => {
  try {
    const { itemsUsed = [] } = req.body;

    const finalItems = await buildProductionItems(itemsUsed);

    if (!finalItems.length) {
      return res.status(400).json({
        success: false,
        message: "At least one used item is required",
      });
    }

    await ensureStockAvailable(finalItems);

    const production = await DailyProduction.create({
      ...req.body,
      itemsUsed: finalItems,
    });

    await reconcileRecipeItemStock(finalItems.map((used) => used.item));

    res.status(201).json({ success: true, production });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

export const getDailyProductions = async (req, res) => {
  try {
    const { locationId, date, from, to } = req.query;

    const filter = {};
    if (locationId) filter.location = locationId;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    } else if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const productions = await DailyProduction.find(filter)
      .populate("location", "name")
      .sort({ date: -1 });

    res.json({ success: true, productions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDailyProduction = async (req, res) => {
  try {
    const production = await DailyProduction.findById(req.params.id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Daily production not found",
      });
    }

    const finalItems = await buildProductionItems(req.body.itemsUsed || []);

    if (!finalItems.length) {
      return res.status(400).json({
        success: false,
        message: "At least one used item is required",
      });
    }

    await ensureStockAvailable(finalItems, production.itemsUsed);

    const oldItems = production.itemsUsed.map((used) => used.toObject());

    production.location = req.body.location ?? production.location;
    production.date = req.body.date ?? production.date;
    production.totalPreparedLiters =
      req.body.totalPreparedLiters ?? production.totalPreparedLiters;
    production.estimatedGlasses =
      req.body.estimatedGlasses ?? production.estimatedGlasses;
    production.notes = req.body.notes ?? production.notes;
    production.itemsUsed = finalItems;

    await production.save();
    await reconcileRecipeItemStock([
      ...oldItems.map((used) => used.item),
      ...finalItems.map((used) => used.item),
    ]);

    res.json({ success: true, production });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

export const deleteDailyProduction = async (req, res) => {
  try {
    const production = await DailyProduction.findById(req.params.id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Daily production not found",
      });
    }

    const itemIds = production.itemsUsed.map((used) => used.item);

    await production.deleteOne();
    await reconcileRecipeItemStock(itemIds);

    res.json({ success: true, message: "Daily production deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
