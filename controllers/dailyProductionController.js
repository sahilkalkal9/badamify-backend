import DailyProduction from "../models/DailyProduction.js";
import RecipeItem from "../models/RecipeItem.js";

export const createDailyProduction = async (req, res) => {
  try {
    const { itemsUsed = [] } = req.body;

    const finalItems = [];

    for (const used of itemsUsed) {
      const recipeItem = await RecipeItem.findById(used.item);

      if (!recipeItem) {
        return res.status(404).json({
          success: false,
          message: `Recipe item not found: ${used.item}`,
        });
      }

      if (recipeItem.currentStock < Number(used.quantityUsed || 0)) {
        return res.status(400).json({
          success: false,
          message: `${recipeItem.name} stock is not enough`,
        });
      }

      finalItems.push({
        item: recipeItem._id,
        itemName: recipeItem.name,
        quantityUsed: Number(used.quantityUsed || 0),
        unit: recipeItem.unit,
        pricePerUnit: recipeItem.pricePerUnit,
        cost: Number(used.quantityUsed || 0) * recipeItem.pricePerUnit,
      });
    }

    const production = await DailyProduction.create({
      ...req.body,
      itemsUsed: finalItems,
    });

    for (const used of finalItems) {
      await RecipeItem.findByIdAndUpdate(used.item, {
        $inc: { currentStock: -Number(used.quantityUsed || 0) },
      });
    }

    res.status(201).json({ success: true, production });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

export const deleteDailyProduction = async (req, res) => {
  try {
    const production = await DailyProduction.findById(req.params.id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Daily production not found",
      });
    }

    for (const used of production.itemsUsed) {
      await RecipeItem.findByIdAndUpdate(used.item, {
        $inc: { currentStock: Number(used.quantityUsed || 0) },
      });
    }

    await production.deleteOne();

    res.json({ success: true, message: "Daily production deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};