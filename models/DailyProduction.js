import mongoose from "mongoose";

const consumedItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipeItem",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    quantityUsed: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "gm", "ltr", "ml", "pcs"],
    },
    pricePerUnit: {
      type: Number,
      required: true,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const dailyProductionSchema = new mongoose.Schema(
  {
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalPreparedLiters: {
      type: Number,
      default: 0,
    },
    estimatedGlasses: {
      type: Number,
      default: 0,
    },
    itemsUsed: [consumedItemSchema],
    totalMakingCost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

dailyProductionSchema.pre("save", function (next) {
  this.itemsUsed = this.itemsUsed.map((item) => ({
    ...item,
    cost: item.quantityUsed * item.pricePerUnit,
  }));

  this.totalMakingCost = this.itemsUsed.reduce(
    (sum, item) => sum + item.cost,
    0
  );

  next();
});

const DailyProduction = mongoose.model(
  "DailyProduction",
  dailyProductionSchema
);

export default DailyProduction;