import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
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
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    glasses: {
      type: Number,
      required: true,
      default: 1,
    },
    pricePerGlass: {
      type: Number,
      required: true,
      default: 59,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    extraAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "paid",
    },
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card", "other", "none"],
      default: "cash",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

saleSchema.pre("save", function (next) {
  this.totalAmount = this.glasses * this.pricePerGlass;

  if (this.paidAmount > this.totalAmount) {
    this.extraAmount = this.paidAmount - this.totalAmount;
  } else {
    this.extraAmount = 0;
  }

  if (this.paidAmount <= 0) {
    this.paymentStatus = "unpaid";
  } else if (this.paidAmount < this.totalAmount) {
    this.paymentStatus = "partial";
  } else {
    this.paymentStatus = "paid";
  }

  next();
});

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;