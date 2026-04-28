import RecipeItem from "../models/RecipeItem.js";

export const createRecipeItem = async (req, res) => {
  try {
    const item = await RecipeItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecipeItems = async (req, res) => {
  try {
    const { locationId } = req.query;

    const filter = {};
    if (locationId) filter.location = locationId;

    const items = await RecipeItem.find(filter)
      .populate("location", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRecipeItem = async (req, res) => {
  try {
    const item = await RecipeItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRecipeItem = async (req, res) => {
  try {
    await RecipeItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Recipe item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};