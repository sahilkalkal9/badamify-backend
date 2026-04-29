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

stockPurchaseSchema.pre("save", async function () {
  const quantity = Number(this.quantity || 0);
  const pricePerUnit = Number(this.pricePerUnit || 0);

  this.totalPrice = quantity * pricePerUnit;

  // payment handling
  if (this.paymentStatus === "paid") {
    this.paidAmount = this.totalPrice;
  } else if (this.paymentStatus === "unpaid") {
    this.paidAmount = 0;
  } else {
    // partial case — ensure not exceeding total
    this.paidAmount = Math.min(
      Number(this.paidAmount || 0),
      this.totalPrice
    );
  }
});

const StockPurchase = mongoose.model("StockPurchase", stockPurchaseSchema);

export default StockPurchase;