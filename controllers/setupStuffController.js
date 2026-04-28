import SetupStuff from "../models/SetupStuff.js";

export const createSetupStuff = async (req, res) => {
  try {
    const stuff = await SetupStuff.create(req.body);
    res.status(201).json({ success: true, stuff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSetupStuff = async (req, res) => {
  try {
    const { locationId } = req.query;

    const filter = {};
    if (locationId) filter.location = locationId;

    const stuff = await SetupStuff.find(filter)
      .populate("location", "name")
      .sort({ purchaseDate: -1 });

    res.json({ success: true, stuff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSetupStuff = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.quantity && payload.pricePerItem) {
      payload.totalPrice = payload.quantity * payload.pricePerItem;
    }

    const stuff = await SetupStuff.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    res.json({ success: true, stuff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSetupStuff = async (req, res) => {
  try {
    await SetupStuff.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Setup stuff deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};