import mongoose from "mongoose";

const stockPurchaseSchema = new mongoose.Schema(
  {
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipeItem",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
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
    totalPrice: {
      type: Number,
      default: 0,
    },
    vendorName: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "paid",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

stockPurchaseSchema.pre("save", function (next) {
  this.totalPrice = this.quantity * this.pricePerUnit;

  if (this.paymentStatus === "paid") {
    this.paidAmount = this.totalPrice;
  }

  next();
});

const StockPurchase = mongoose.model("StockPurchase", stockPurchaseSchema);

export default StockPurchase;