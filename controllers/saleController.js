import Sale from "../models/Sale.js";

export const createSale = async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSales = async (req, res) => {
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

    const sales = await Sale.find(filter)
      .populate("location", "name")
      .sort({ date: -1 });

    res.json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    Object.assign(sale, req.body);
    await sale.save();

    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Sale deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};