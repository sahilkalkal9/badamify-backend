import Location from "../models/Location.js";

export const createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res.json({ success: true, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Location deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};