import RecipeItem from "../models/RecipeItem.js";

export const createRecipeItem = async (req, res) => {
  try {
    const payload = { ...req.body };

    delete payload.location;

    const item = await RecipeItem.create(payload);

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecipeItems = async (req, res) => {
  try {
    const items = await RecipeItem.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRecipeItem = async (req, res) => {
  try {
    const payload = { ...req.body };

    delete payload.location;

    const item = await RecipeItem.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Recipe item not found",
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRecipeItem = async (req, res) => {
  try {
    const item = await RecipeItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Recipe item not found",
      });
    }

    res.json({
      success: true,
      message: "Recipe item deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};