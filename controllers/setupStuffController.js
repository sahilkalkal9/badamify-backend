import SetupStuff from "../models/SetupStuff.js";

export const createSetupStuff = async (req, res) => {
  try {
    const payload = { ...req.body };

    payload.quantity = Number(payload.quantity || 1);
    payload.pricePerItem = Number(payload.pricePerItem || 0);
    payload.totalPrice = payload.quantity * payload.pricePerItem;

    const stuff = await SetupStuff.create(payload);

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

    payload.quantity = Number(payload.quantity || 1);
    payload.pricePerItem = Number(payload.pricePerItem || 0);
    payload.totalPrice = payload.quantity * payload.pricePerItem;

    const stuff = await SetupStuff.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!stuff) {
      return res
        .status(404)
        .json({ success: false, message: "Setup stuff not found" });
    }

    res.json({ success: true, stuff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSetupStuff = async (req, res) => {
  try {
    const stuff = await SetupStuff.findByIdAndDelete(req.params.id);

    if (!stuff) {
      return res
        .status(404)
        .json({ success: false, message: "Setup stuff not found" });
    }

    res.json({ success: true, message: "Setup stuff deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};