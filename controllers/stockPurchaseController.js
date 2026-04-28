import StockPurchase from "../models/StockPurchase.js";
import RecipeItem from "../models/RecipeItem.js";

export const createStockPurchase = async (req, res) => {
  try {
    const { item, quantity, pricePerUnit } = req.body;

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

    const purchase = await StockPurchase.create(payload);

    recipeItem.currentStock += Number(quantity || 0);
    recipeItem.pricePerUnit = Number(payload.pricePerUnit || 0);
    await recipeItem.save();

    res.status(201).json({ success: true, purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockPurchases = async (req, res) => {
  try {
    const { locationId, from, to } = req.query;

    const filter = {};
    if (locationId) filter.location = locationId;

    if (from || to) {
      filter.purchaseDate = {};
      if (from) filter.purchaseDate.$gte = new Date(from);
      if (to) filter.purchaseDate.$lte = new Date(to);
    }

    const purchases = await StockPurchase.find(filter)
      .populate("location", "name")
      .populate("item", "name unit currentStock")
      .sort({ purchaseDate: -1 });

    res.json({ success: true, purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const oldQuantity = purchase.quantity;

    Object.assign(purchase, req.body);

    purchase.totalPrice = purchase.quantity * purchase.pricePerUnit;

    if (purchase.paymentStatus === "paid") {
      purchase.paidAmount = purchase.totalPrice;
    }

    await purchase.save();

    const recipeItem = await RecipeItem.findById(purchase.item);

    if (recipeItem) {
      const difference = Number(purchase.quantity || 0) - Number(oldQuantity || 0);
      recipeItem.currentStock += difference;
      recipeItem.pricePerUnit = purchase.pricePerUnit;
      await recipeItem.save();
    }

    res.json({ success: true, purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const recipeItem = await RecipeItem.findById(purchase.item);

    if (recipeItem) {
      recipeItem.currentStock -= Number(purchase.quantity || 0);
      if (recipeItem.currentStock < 0) recipeItem.currentStock = 0;
      await recipeItem.save();
    }

    await purchase.deleteOne();

    res.json({ success: true, message: "Stock purchase deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};